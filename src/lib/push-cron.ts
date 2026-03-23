import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendPushToAll, sendPushToUsers } from "@/lib/push";

let intervalId: ReturnType<typeof setInterval> | null = null;

// Track already-notified match+type combos to avoid duplicates
const notified = new Set<string>();

function key(matchId: string, type: string): string {
  return `${matchId}:${type}`;
}

async function runPushCron() {
  try {
    const now = new Date();

    // --- 30 minutes before kickoff ---
    const min30From = new Date(now.getTime() + 28 * 60_000).toISOString();
    const min30To = new Date(now.getTime() + 32 * 60_000).toISOString();

    const { data: upcoming30 } = await supabaseAdmin
      .from("matches")
      .select("id, home_team, away_team")
      .eq("status", "scheduled")
      .gte("kickoff_at", min30From)
      .lte("kickoff_at", min30To);

    for (const m of upcoming30 ?? []) {
      const k = key(m.id, "30min");
      if (notified.has(k)) continue;
      notified.add(k);
      await sendPushToAll(
        "En 30 minutos",
        `${m.home_team} vs ${m.away_team}`,
        `/es/match/${m.id}`
      );
    }

    // --- 5 minutes before kickoff ---
    const min5From = new Date(now.getTime() + 3 * 60_000).toISOString();
    const min5To = new Date(now.getTime() + 7 * 60_000).toISOString();

    const { data: upcoming5 } = await supabaseAdmin
      .from("matches")
      .select("id, home_team, away_team")
      .eq("status", "scheduled")
      .gte("kickoff_at", min5From)
      .lte("kickoff_at", min5To);

    for (const m of upcoming5 ?? []) {
      const k = key(m.id, "5min");
      if (notified.has(k)) continue;
      notified.add(k);
      await sendPushToAll(
        "Arranca en 5",
        `${m.home_team} vs ${m.away_team} — entra ahora`,
        `/es/match/${m.id}`
      );
    }

    // --- Just finished (status = 'finished', recent) ---
    const twoMinAgo = new Date(now.getTime() - 2 * 60_000).toISOString();

    // We check finished matches and see if we already notified
    const { data: finished } = await supabaseAdmin
      .from("matches")
      .select("id, home_team, away_team")
      .eq("status", "finished");

    for (const m of finished ?? []) {
      const k = key(m.id, "finished");
      if (notified.has(k)) continue;
      notified.add(k);

      // Get distinct user_ids who reacted in this match (recently finished)
      // We only send to users who participated
      const { data: userRows } = await supabaseAdmin
        .from("reactions")
        .select("user_id")
        .eq("match_id", m.id);

      if (!userRows || userRows.length === 0) continue;

      const uniqueUserIds = [
        ...new Set(userRows.map((r) => r.user_id as string)),
      ];

      await sendPushToUsers(
        uniqueUserIds,
        "Tu receipt esta listo",
        `${m.home_team} vs ${m.away_team} — miralo ahora`,
        `/es/match/${m.id}/receipt`
      );
    }

    // Cleanup: remove old entries from the set to prevent memory leak
    // Keep only entries for matches that are still relevant (within last 24h)
    if (notified.size > 500) {
      notified.clear();
    }
  } catch (err) {
    console.error("[push-cron] Unexpected error:", err);
  }
}

export function startPushCron() {
  if (intervalId) return;
  console.log("[push-cron] Started (every 60s)");
  intervalId = setInterval(runPushCron, 60_000);
}

export function stopPushCron() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[push-cron] Stopped");
  }
}
