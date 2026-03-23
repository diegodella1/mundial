import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { containsBlockedWord } from "@/lib/moderation";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: { match_id: string; body: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { match_id, body: messageBody } = body;
  if (!match_id || !messageBody) {
    return NextResponse.json(
      { error: "match_id and body are required" },
      { status: 400 }
    );
  }

  // 2. Validate match_id is a valid UUID
  if (!UUID_RE.test(match_id)) {
    return NextResponse.json(
      { error: "Invalid match_id format" },
      { status: 400 }
    );
  }

  if (messageBody.length > 280) {
    return NextResponse.json(
      { error: "Message too long (max 280)" },
      { status: 400 }
    );
  }

  // 3. Get user from Supabase auth via request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Auth check
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 5. Rate limit: 1 message per 3 seconds per user
  if (!checkRateLimit(`chat:${user.id}`, 3000)) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  // 6. Check user not banned (two separate queries, no .or())
  const [{ data: matchBans }, { data: globalBans }] = await Promise.all([
    supabaseAdmin
      .from("user_bans")
      .select("id")
      .eq("user_id", user.id)
      .eq("match_id", match_id)
      .gt("banned_until", new Date().toISOString())
      .limit(1),
    supabaseAdmin
      .from("user_bans")
      .select("id")
      .eq("user_id", user.id)
      .is("match_id", null)
      .gt("banned_until", new Date().toISOString())
      .limit(1),
  ]);

  if ((matchBans && matchBans.length > 0) || (globalBans && globalBans.length > 0)) {
    return NextResponse.json({ error: "Banned" }, { status: 403 });
  }

  // 7. Check match exists and chat_enabled
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("id, chat_enabled")
    .eq("id", match_id)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (!match.chat_enabled) {
    return NextResponse.json({ error: "Chat disabled" }, { status: 403 });
  }

  // 8. Check moderation
  const isBlocked = await containsBlockedWord(messageBody);

  // 9. Get user profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name || "Anon";
  const avatarUrl = profile?.avatar_url || null;

  // 10. Insert into chat_messages
  const { data: message, error: insertError } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      match_id,
      user_id: user.id,
      display_name: displayName,
      avatar_url: avatarUrl,
      body: messageBody,
      is_blocked: isBlocked,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to insert chat message:", insertError.message);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  // 11. Return
  if (isBlocked) {
    return NextResponse.json({ blocked: true }, { status: 201 });
  }

  return NextResponse.json(message, { status: 201 });
}
