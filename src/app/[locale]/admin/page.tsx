import { supabaseAdmin } from "@/lib/supabase/admin";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  // Total reactions
  const { count: totalReactions } = await supabaseAdmin
    .from("reactions")
    .select("*", { count: "exact", head: true });

  // Live matches
  const { count: liveMatches } = await supabaseAdmin
    .from("matches")
    .select("*", { count: "exact", head: true })
    .in("status", ["live", "halftime"]);

  // Total users
  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Recent reactions (last 24h)
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();
  const { count: recentReactions } = await supabaseAdmin
    .from("reactions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", twentyFourHoursAgo);

  // Finished matches for receipt generation
  const { data: finishedMatches } = await supabaseAdmin
    .from("matches")
    .select("id, home_team, away_team, home_code, away_code, home_score, away_score, kickoff_at")
    .eq("status", "finished")
    .order("kickoff_at", { ascending: false });

  return (
    <DashboardClient
      totalReactions={totalReactions ?? 0}
      liveMatches={liveMatches ?? 0}
      totalUsers={totalUsers ?? 0}
      recentReactions={recentReactions ?? 0}
      finishedMatches={finishedMatches ?? []}
    />
  );
}
