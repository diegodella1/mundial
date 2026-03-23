import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COUNTRY_CODE_RE = /^[A-Z]{2}$/;

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: {
    match_id: string;
    reaction_type: string;
    team_supported?: string;
    country_code?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { match_id, reaction_type, team_supported, country_code: bodyCountry } = body;
  if (!match_id || !reaction_type) {
    return NextResponse.json(
      { error: "match_id and reaction_type are required" },
      { status: 400 }
    );
  }

  // 2. Validate UUIDs
  if (!UUID_RE.test(match_id)) {
    return NextResponse.json(
      { error: "Invalid match_id format" },
      { status: 400 }
    );
  }

  if (!UUID_RE.test(reaction_type)) {
    return NextResponse.json(
      { error: "Invalid reaction_type format" },
      { status: 400 }
    );
  }

  // 3. Validate country_code if provided in body
  if (bodyCountry && !COUNTRY_CODE_RE.test(bodyCountry)) {
    return NextResponse.json(
      { error: "Invalid country_code format (expected 2 uppercase letters)" },
      { status: 400 }
    );
  }

  // 4. Validate reaction_type exists and is active
  const { data: reactionConfig } = await supabaseAdmin
    .from("reactions_config")
    .select("id")
    .eq("id", reaction_type)
    .eq("is_active", true)
    .single();

  if (!reactionConfig) {
    return NextResponse.json(
      { error: "Unknown or inactive reaction type" },
      { status: 400 }
    );
  }

  // 5. Validate match exists and is in an allowed status
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("started_at, status")
    .eq("id", match_id)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const allowedStatuses = ["live", "halftime", "scheduled"];
  if (!allowedStatuses.includes(match.status)) {
    return NextResponse.json(
      { error: "Reactions not allowed for this match status" },
      { status: 403 }
    );
  }

  // 6. Try to get user from Supabase auth (OPTIONAL)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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

  // 7. Rate limit: by user_id if logged in, by IP if anonymous
  const rateLimitKey = user
    ? user.id
    : request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

  if (!checkRateLimit(rateLimitKey, 1000)) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  // 8. Ban check — only for authenticated users (two separate queries, no .or())
  if (user) {
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
  }

  // 9. Resolve country_code: body (anonymous) > headers > fallback
  const rawCountry =
    bodyCountry ||
    request.headers.get("x-country-code") ||
    request.headers.get("cf-ipcountry") ||
    "XX";

  // Sanitize header-derived country codes too
  const country_code = COUNTRY_CODE_RE.test(rawCountry) ? rawCountry : "XX";

  // 10. Compute match_minute
  let match_minute: number | null = null;
  if (match.started_at && match.status === "live") {
    const elapsed = Date.now() - new Date(match.started_at).getTime();
    match_minute = Math.floor(elapsed / 60_000);
  }

  // 11. Insert reaction (user_id is null for anonymous)
  const { error: insertError } = await supabaseAdmin.from("reactions").insert({
    match_id,
    user_id: user?.id ?? null,
    reaction_type,
    team_supported: team_supported || null,
    country_code,
    match_minute,
  });

  if (insertError) {
    console.error("Failed to insert reaction:", insertError.message);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  // 12. Broadcast reaction to match channel for real-time hero bubbles
  supabaseAdmin.channel(`match_${match_id}`).send({
    type: "broadcast",
    event: "reaction",
    payload: { emoji: reaction_type, team_supported: team_supported || null, country_code },
  }).catch(() => {
    // Non-critical: don't fail the request if broadcast fails
  });

  // 13. Success
  return NextResponse.json({ ok: true }, { status: 201 });
}
