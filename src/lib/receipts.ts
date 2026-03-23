import { SupabaseClient } from "@supabase/supabase-js";

export interface ReceiptData {
  match: {
    home_team: string;
    away_team: string;
    home_code: string;
    away_code: string;
    home_score: number;
    away_score: number;
    kickoff_at: string;
  };
  teamSupported: string | null;
  topReactions: {
    emoji: string;
    label: string;
    count: number;
    minutes: number[];
  }[];
  highlightMinute: {
    minute: number;
    emoji: string;
    event: string | null;
  } | null;
  countryComparison: {
    userCountry: string;
    userTopEmoji: string;
    globalTopEmoji: string;
  } | null;
  totalReactions: number;
  totalUsers: number;
}

/**
 * Generate receipt data for a specific user and match.
 * Uses the admin client to bypass RLS.
 */
export async function generateReceiptData(
  admin: SupabaseClient,
  userId: string,
  matchId: string
): Promise<ReceiptData> {
  // 1. Get match data
  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("home_team, away_team, home_code, away_code, home_score, away_score, kickoff_at")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    throw new Error(`Match not found: ${matchId}`);
  }

  // 2. Get user's reactions grouped by reaction_type with count
  const { data: userReactions } = await admin
    .from("reactions")
    .select("reaction_type, match_minute")
    .eq("match_id", matchId)
    .eq("user_id", userId);

  const reactionGroups: Record<string, { count: number; minutes: number[] }> = {};
  for (const r of userReactions ?? []) {
    if (!reactionGroups[r.reaction_type]) {
      reactionGroups[r.reaction_type] = { count: 0, minutes: [] };
    }
    reactionGroups[r.reaction_type].count++;
    if (r.match_minute != null) {
      reactionGroups[r.reaction_type].minutes.push(r.match_minute);
    }
  }

  // 3. Get reactions_config for labels/emojis
  const reactionTypeIds = Object.keys(reactionGroups);
  let topReactions: ReceiptData["topReactions"] = [];

  if (reactionTypeIds.length > 0) {
    const { data: configs } = await admin
      .from("reactions_config")
      .select("id, emoji, label_es")
      .in("id", reactionTypeIds);

    const enriched = (configs ?? []).map((c) => ({
      emoji: c.emoji,
      label: c.label_es,
      count: reactionGroups[c.id].count,
      minutes: reactionGroups[c.id].minutes.sort((a, b) => a - b),
    }));

    // Top 3 by count
    topReactions = enriched.sort((a, b) => b.count - a.count).slice(0, 3);
  }

  // 4. Get match_events for highlight cross-reference
  const { data: events } = await admin
    .from("match_events")
    .select("event_minute, event_kind, team_code, player_name, detail")
    .eq("match_id", matchId)
    .order("event_minute", { ascending: true });

  // 5. Find the user's most active minute (highest reaction density)
  let highlightMinute: ReceiptData["highlightMinute"] = null;
  const minuteCounts: Record<number, { count: number; emoji: string }> = {};

  for (const r of userReactions ?? []) {
    if (r.match_minute == null) continue;
    if (!minuteCounts[r.match_minute]) {
      // Find the emoji for this reaction_type
      // Find the emoji for this reaction_type from the groups
      minuteCounts[r.match_minute] = { count: 0, emoji: "" };
    }
    minuteCounts[r.match_minute].count++;
  }

  // Assign emojis to minutes based on most common reaction at that minute
  const minuteReactions: Record<number, Record<string, number>> = {};
  for (const r of userReactions ?? []) {
    if (r.match_minute == null) continue;
    if (!minuteReactions[r.match_minute]) minuteReactions[r.match_minute] = {};
    minuteReactions[r.match_minute][r.reaction_type] =
      (minuteReactions[r.match_minute][r.reaction_type] || 0) + 1;
  }

  // Get configs map for emoji lookup
  const configMap: Record<string, string> = {};
  if (reactionTypeIds.length > 0) {
    const { data: allConfigs } = await admin
      .from("reactions_config")
      .select("id, emoji")
      .in("id", reactionTypeIds);
    for (const c of allConfigs ?? []) {
      configMap[c.id] = c.emoji;
    }
  }

  let maxMinuteCount = 0;
  let bestMinute = -1;
  let bestEmoji = "";

  for (const [min, reactions] of Object.entries(minuteReactions)) {
    const totalAtMinute = Object.values(reactions).reduce((a, b) => a + b, 0);
    if (totalAtMinute > maxMinuteCount) {
      maxMinuteCount = totalAtMinute;
      bestMinute = Number(min);
      // Find the top emoji at this minute
      const topType = Object.entries(reactions).sort(([, a], [, b]) => b - a)[0][0];
      bestEmoji = configMap[topType] || "";
    }
  }

  if (bestMinute >= 0) {
    // Cross-reference with match events
    const matchEvent = (events ?? []).find(
      (e) => Math.abs(e.event_minute - bestMinute) <= 2
    );

    let eventLabel: string | null = null;
    if (matchEvent) {
      const kind = matchEvent.event_kind.replace("_", " ");
      eventLabel = matchEvent.player_name
        ? `${kind} - ${matchEvent.player_name}`
        : kind;
    }

    highlightMinute = {
      minute: bestMinute,
      emoji: bestEmoji,
      event: eventLabel,
    };
  }

  // 6. Get user's team selection
  const { data: teamSelection } = await admin
    .from("user_match_teams")
    .select("team_code")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .single();

  // 7. Country comparison
  const { data: profile } = await admin
    .from("profiles")
    .select("country_code")
    .eq("id", userId)
    .single();

  let countryComparison: ReceiptData["countryComparison"] = null;

  if (profile?.country_code) {
    // User's country top emoji
    const { data: countryReactions } = await admin
      .from("reactions")
      .select("reaction_type")
      .eq("match_id", matchId)
      .eq("country_code", profile.country_code);

    const countryCounts: Record<string, number> = {};
    for (const r of countryReactions ?? []) {
      countryCounts[r.reaction_type] = (countryCounts[r.reaction_type] || 0) + 1;
    }

    const countryTopType = Object.entries(countryCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    // Global top emoji
    const { data: globalReactions } = await admin
      .from("reactions")
      .select("reaction_type")
      .eq("match_id", matchId);

    const globalCounts: Record<string, number> = {};
    for (const r of globalReactions ?? []) {
      globalCounts[r.reaction_type] = (globalCounts[r.reaction_type] || 0) + 1;
    }

    const globalTopType = Object.entries(globalCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    // Resolve emojis
    const typesToResolve = [countryTopType, globalTopType].filter(Boolean) as string[];
    const emojiMap: Record<string, string> = {};
    if (typesToResolve.length > 0) {
      const { data: emojiConfigs } = await admin
        .from("reactions_config")
        .select("id, emoji")
        .in("id", typesToResolve);
      for (const c of emojiConfigs ?? []) {
        emojiMap[c.id] = c.emoji;
      }
    }

    countryComparison = {
      userCountry: profile.country_code,
      userTopEmoji: countryTopType ? (emojiMap[countryTopType] || "?") : "?",
      globalTopEmoji: globalTopType ? (emojiMap[globalTopType] || "?") : "?",
    };
  }

  // 8. Total reactions and unique users for this match
  const { data: allMatchReactions } = await admin
    .from("reactions")
    .select("user_id")
    .eq("match_id", matchId);

  const totalReactions = allMatchReactions?.length ?? 0;
  const uniqueUsers = new Set((allMatchReactions ?? []).map((r) => r.user_id));

  return {
    match: {
      home_team: match.home_team,
      away_team: match.away_team,
      home_code: match.home_code,
      away_code: match.away_code,
      home_score: match.home_score,
      away_score: match.away_score,
      kickoff_at: match.kickoff_at,
    },
    teamSupported: teamSelection?.team_code ?? null,
    topReactions,
    highlightMinute,
    countryComparison,
    totalReactions,
    totalUsers: uniqueUsers.size,
  };
}
