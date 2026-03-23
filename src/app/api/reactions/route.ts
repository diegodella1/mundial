import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: { match_id: string; reaction_type: string; team_supported?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { match_id, reaction_type, team_supported } = body;
  if (!match_id || !reaction_type) {
    return NextResponse.json(
      { error: "match_id and reaction_type are required" },
      { status: 400 }
    );
  }

  // 2. Get user from Supabase auth via request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Route handlers can't set cookies on the request, but we need the interface
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

  // 3. Auth check
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Rate limit: 1 reaction per second per user
  if (!checkRateLimit(user.id, 1000)) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  // 5. Check user not banned (use admin client to bypass RLS)
  const { data: bans } = await supabaseAdmin
    .from("user_bans")
    .select("id")
    .eq("user_id", user.id)
    .gt("banned_until", new Date().toISOString())
    .or(`match_id.eq.${match_id},match_id.is.null`)
    .limit(1);

  if (bans && bans.length > 0) {
    return NextResponse.json({ error: "Banned" }, { status: 403 });
  }

  // 6. Get country_code from request headers
  const country_code =
    request.headers.get("x-country-code") ||
    request.headers.get("cf-ipcountry") ||
    "XX";

  // 7. Get match_minute from matches table
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("started_at, status")
    .eq("id", match_id)
    .single();

  let match_minute: number | null = null;
  if (match?.started_at && match.status === "live") {
    const elapsed = Date.now() - new Date(match.started_at).getTime();
    match_minute = Math.floor(elapsed / 60_000);
  }

  // 8. Insert reaction
  const { error: insertError } = await supabaseAdmin.from("reactions").insert({
    match_id,
    user_id: user.id,
    reaction_type,
    team_supported: team_supported || null,
    country_code,
    match_minute,
  });

  if (insertError) {
    console.error("Failed to insert reaction:", insertError.message);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  // 9. Success
  return NextResponse.json({ ok: true }, { status: 201 });
}
