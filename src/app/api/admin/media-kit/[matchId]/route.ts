import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import { createMediaKitDocument } from "@/lib/media-kit-pdf";

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

  // Get match data
  const { data: match } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "finished") {
    return NextResponse.json(
      { error: "Match not finished yet" },
      { status: 400 }
    );
  }

  // Get all reactions for this match
  const { data: reactionsRaw } = await supabaseAdmin
    .from("reactions")
    .select("user_id, reaction_type, match_minute, country_code")
    .eq("match_id", matchId);

  const totalReactions = reactionsRaw?.length ?? 0;
  const uniqueUserIds = new Set((reactionsRaw ?? []).map((r) => r.user_id));
  const totalUsers = uniqueUserIds.size;

  const { data: reactionConfigs } = await supabaseAdmin
    .from("reactions_config")
    .select("id, emoji, label_es");

  // Build reaction type counts
  const configMap = new Map<string, { emoji: string; label: string }>();
  for (const rc of reactionConfigs ?? []) {
    configMap.set(rc.id, { emoji: rc.emoji, label: rc.label_es });
  }

  const typeCounts: Record<string, { emoji: string; label: string; count: number }> = {};
  const countryCounts: Record<string, number> = {};
  const minuteCounts: Record<number, number> = {};

  for (const r of reactionsRaw ?? []) {
    // Reaction type breakdown
    const typeId = r.reaction_type as string;
    if (!typeCounts[typeId]) {
      const config = configMap.get(typeId);
      typeCounts[typeId] = {
        emoji: config?.emoji ?? "?",
        label: config?.label ?? "Desconocido",
        count: 0,
      };
    }
    typeCounts[typeId].count++;

    // Country breakdown
    const cc = (r.country_code as string) || "XX";
    countryCounts[cc] = (countryCounts[cc] || 0) + 1;

    // Minute breakdown
    const minute = r.match_minute as number | null;
    if (minute != null) {
      minuteCounts[minute] = (minuteCounts[minute] || 0) + 1;
    }
  }

  // Sort reactions by count desc
  const reactionBreakdown = Object.values(typeCounts).sort(
    (a, b) => b.count - a.count
  );

  // Top 5 countries
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));

  // Peak minute
  let peakMinute = 0;
  let peakCount = 0;
  for (const [min, count] of Object.entries(minuteCounts)) {
    if (count > peakCount) {
      peakCount = count;
      peakMinute = Number(min);
    }
  }

  // Get match events near peak minute (to correlate)
  const { data: peakEvents } = await supabaseAdmin
    .from("match_events")
    .select("event_kind, event_minute, team_code, player_name")
    .eq("match_id", matchId)
    .gte("event_minute", peakMinute - 1)
    .lte("event_minute", peakMinute + 1)
    .order("event_minute");

  // Build PDF data
  const pdfData = {
    homeTeam: match.home_team as string,
    awayTeam: match.away_team as string,
    homeCode: match.home_code as string,
    awayCode: match.away_code as string,
    homeScore: match.home_score as number,
    awayScore: match.away_score as number,
    kickoffAt: match.kickoff_at as string,
    totalUsers,
    totalReactions,
    reactionBreakdown,
    topCountries,
    peakMinute,
    peakReactions: peakCount,
    peakEvents: (peakEvents ?? []).map((e) => ({
      kind: e.event_kind as string,
      minute: e.event_minute as number,
      team: e.team_code as string,
      player: e.player_name as string | null,
    })),
  };

  // Generate PDF
  const doc = createMediaKitDocument(pdfData);
  const buffer = await renderToBuffer(doc);

  const filename = `matchfeel_${match.home_code}_vs_${match.away_code}.pdf`;

  const uint8 = new Uint8Array(buffer);
  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
