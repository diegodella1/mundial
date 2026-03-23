import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  // Auth: verify admin
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get match info for filename
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("home_code, away_code")
    .eq("id", matchId)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  // Get all reactions for this match, joined with reactions_config for emoji
  const { data: reactions, error } = await supabaseAdmin
    .from("reactions")
    .select(
      "created_at, country_code, team_supported, match_minute, reaction_type:reactions_config!inner(emoji)"
    )
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[export]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build CSV
  const header = "timestamp,user_country,team_supported,reaction_emoji,match_minute";
  const rows = (reactions ?? []).map((r) => {
    const emoji =
      r.reaction_type && typeof r.reaction_type === "object" && "emoji" in r.reaction_type
        ? (r.reaction_type as { emoji: string }).emoji
        : "";
    const ts = r.created_at ?? "";
    const country = r.country_code ?? "";
    const team = r.team_supported ?? "";
    const minute = r.match_minute ?? "";
    return `${ts},${country},${team},${emoji},${minute}`;
  });

  const csv = [header, ...rows].join("\n");
  const filename = `reactions_${match.home_code}_vs_${match.away_code}_${matchId.slice(0, 8)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
