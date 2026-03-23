import { supabaseAdmin } from "@/lib/supabase/admin";

const BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

/**
 * Check if API-Football is configured (API key present).
 */
export function isConfigured(): boolean {
  return !!API_KEY;
}

function assertConfigured(): void {
  if (!API_KEY) {
    throw new Error(
      "API_FOOTBALL_KEY is not set. Configure it in your environment variables."
    );
  }
}

async function apiFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  assertConfigured();

  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": API_KEY!,
    },
  });

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json as T;
}

// ---- Types for API-Football responses ----

type APIFixtureResponse = {
  response: Array<{
    fixture: {
      id: number;
      date: string;
      status: {
        short: string;
        elapsed: number | null;
      };
    };
    league: {
      round: string;
    };
    teams: {
      home: { id: number; name: string; logo: string };
      away: { id: number; name: string; logo: string };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
  }>;
};

type APIEventResponse = {
  response: Array<{
    time: { elapsed: number; extra: number | null };
    team: { id: number; name: string };
    player: { id: number; name: string };
    type: string;
    detail: string;
  }>;
};

// ---- Mapping helpers ----

function mapApiStatus(short: string): string {
  switch (short) {
    case "NS":
      return "scheduled";
    case "1H":
    case "2H":
    case "ET":
    case "P":
    case "LIVE":
      return "live";
    case "HT":
      return "halftime";
    case "FT":
    case "AET":
    case "PEN":
      return "finished";
    case "PST":
    case "CANC":
    case "ABD":
    case "AWD":
    case "WO":
      return "postponed";
    default:
      return "scheduled";
  }
}

function mapApiRound(round: string): string {
  const lower = round.toLowerCase();
  if (lower.includes("group")) return "group";
  if (lower.includes("16") || lower.includes("round of 16")) return "r16";
  if (lower.includes("quarter")) return "quarter";
  if (lower.includes("semi")) return "semi";
  if (lower.includes("3rd") || lower.includes("third")) return "third";
  if (lower.includes("final") && !lower.includes("semi") && !lower.includes("quarter"))
    return "final";
  return "group";
}

function teamCodeFromName(name: string): string {
  // Return first 3 chars uppercase as fallback
  return name.slice(0, 3).toUpperCase();
}

function mapEventType(
  type: string,
  detail: string
): string | null {
  const t = type.toLowerCase();
  const d = detail.toLowerCase();
  if (t === "goal" && d === "normal goal") return "goal";
  if (t === "goal" && d === "own goal") return "own_goal";
  if (t === "goal" && d === "penalty") return "penalty_scored";
  if (t === "goal" && d.includes("missed")) return "penalty_missed";
  if (t === "card" && d.includes("yellow")) return "yellow_card";
  if (t === "card" && d.includes("red")) return "red_card";
  if (t === "subst") return "substitution";
  if (t === "var") return "var";
  return null;
}

/**
 * Fetch and sync all World Cup 2026 fixtures from API-Football.
 * Upserts by api_football_id.
 */
export async function syncFixtures(): Promise<{ created: number; updated: number }> {
  assertConfigured();

  const data = await apiFetch<APIFixtureResponse>("/fixtures", {
    league: "1",
    season: "2026",
  });

  let created = 0;
  let updated = 0;

  for (const item of data.response) {
    const payload = {
      api_football_id: item.fixture.id,
      home_team: item.teams.home.name,
      away_team: item.teams.away.name,
      home_code: teamCodeFromName(item.teams.home.name),
      away_code: teamCodeFromName(item.teams.away.name),
      home_logo: item.teams.home.logo,
      away_logo: item.teams.away.logo,
      kickoff_at: item.fixture.date,
      status: mapApiStatus(item.fixture.status.short),
      home_score: item.goals.home ?? 0,
      away_score: item.goals.away ?? 0,
      match_minute: item.fixture.status.elapsed,
      round: mapApiRound(item.league.round),
    };

    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from("matches")
      .select("id")
      .eq("api_football_id", item.fixture.id)
      .single();

    if (existing) {
      await supabaseAdmin
        .from("matches")
        .update(payload)
        .eq("api_football_id", item.fixture.id);
      updated++;
    } else {
      await supabaseAdmin.from("matches").insert(payload);
      created++;
    }
  }

  return { created, updated };
}

/**
 * Sync live data for a specific match from API-Football.
 * Updates match status, scores, match_minute, and events.
 */
export async function syncLiveMatch(matchId: string): Promise<void> {
  assertConfigured();

  // Get match from our DB
  const { data: match, error: matchError } = await supabaseAdmin
    .from("matches")
    .select("id, api_football_id, home_code, away_code")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    throw new Error(`Match not found: ${matchId}`);
  }

  if (!match.api_football_id) {
    throw new Error(`Match ${matchId} has no api_football_id. Cannot sync from API-Football.`);
  }

  // Fetch fixture data
  const fixtureData = await apiFetch<APIFixtureResponse>("/fixtures", {
    id: String(match.api_football_id),
  });

  const fixture = fixtureData.response[0];
  if (!fixture) {
    throw new Error(`API-Football returned no data for fixture ${match.api_football_id}`);
  }

  // Update match
  await supabaseAdmin
    .from("matches")
    .update({
      status: mapApiStatus(fixture.fixture.status.short),
      home_score: fixture.goals.home ?? 0,
      away_score: fixture.goals.away ?? 0,
      match_minute: fixture.fixture.status.elapsed,
    })
    .eq("id", matchId);

  // Fetch and upsert events
  const eventsData = await apiFetch<APIEventResponse>("/fixtures/events", {
    fixture: String(match.api_football_id),
  });

  for (const event of eventsData.response) {
    const eventKind = mapEventType(event.type, event.detail);
    if (!eventKind) continue;

    // Determine team_code from team name
    const teamCode =
      event.team.name === fixture.teams.home.name
        ? match.home_code
        : match.away_code;

    const eventMinute = event.time.elapsed + (event.time.extra ?? 0);

    // Check if this event already exists (same match, minute, player, type)
    const { data: existingEvent } = await supabaseAdmin
      .from("match_events")
      .select("id")
      .eq("match_id", matchId)
      .eq("event_kind", eventKind)
      .eq("event_minute", eventMinute)
      .eq("player_name", event.player.name)
      .limit(1);

    if (!existingEvent || existingEvent.length === 0) {
      await supabaseAdmin.from("match_events").insert({
        match_id: matchId,
        event_kind: eventKind,
        event_minute: eventMinute,
        team_code: teamCode,
        player_name: event.player.name,
        detail: event.detail,
      });
    }
  }
}
