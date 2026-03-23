import { createClient } from "@/lib/supabase/server";

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  kickoff_at: string;
  status: "scheduled" | "live" | "halftime" | "finished" | "postponed";
  home_score: number;
  away_score: number;
  match_minute: number | null;
  group_name: string | null;
  round: string | null;
}

interface MatchGroups {
  live: Match[];
  upcoming: Match[];
  finished: Match[];
}

export async function getMatches(): Promise<MatchGroups> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Fetch live matches (live or halftime)
  const { data: live } = await supabase
    .from("matches")
    .select("*")
    .in("status", ["live", "halftime"])
    .order("kickoff_at", { ascending: true });

  // Fetch upcoming matches
  const { data: upcoming } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "scheduled")
    .gte("kickoff_at", now)
    .order("kickoff_at", { ascending: true });

  // Fetch recently finished matches (last 48 hours)
  const { data: finished } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "finished")
    .gte("kickoff_at", twoDaysAgo)
    .order("kickoff_at", { ascending: false });

  return {
    live: (live as Match[]) ?? [],
    upcoming: (upcoming as Match[]) ?? [],
    finished: (finished as Match[]) ?? [],
  };
}
