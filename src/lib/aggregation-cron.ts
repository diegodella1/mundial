import { supabaseAdmin } from "@/lib/supabase/admin";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface AggregateRow {
  country_code: string;
  reaction_count: number;
  top_emoji: string;
}

interface MapState {
  countries: Record<string, { count: number; top: string }>;
  totalActive: number;
  ts: number;
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let channel: RealtimeChannel | null = null;

async function runAggregation() {
  try {
    const { data, error } = await supabaseAdmin.rpc("aggregate_reactions", {
      p_seconds: 10,
    });

    if (error) {
      console.error("[aggregation-cron] RPC error:", error.message);
      return;
    }

    const rows = (data as AggregateRow[]) || [];

    // Build map state payload
    const countries: MapState["countries"] = {};
    let totalActive = 0;

    for (const row of rows) {
      countries[row.country_code] = {
        count: row.reaction_count,
        top: row.top_emoji,
      };
      totalActive += row.reaction_count;
    }

    const payload: MapState = {
      countries,
      totalActive,
      ts: Date.now(),
    };

    // Broadcast to the reused channel
    if (channel) {
      await channel.send({
        type: "broadcast",
        event: "update",
        payload,
      });
    }
  } catch (err) {
    console.error("[aggregation-cron] Unexpected error:", err);
  }
}

export function startAggregationCron() {
  if (intervalId) return; // Already running

  // Create channel once and reuse it
  channel = supabaseAdmin.channel("map_state");
  channel.subscribe();

  console.log("[aggregation-cron] Started (every 5s)");
  intervalId = setInterval(runAggregation, 5_000);
}

export function stopAggregationCron() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (channel) {
    supabaseAdmin.removeChannel(channel);
    channel = null;
  }
  console.log("[aggregation-cron] Stopped");
}
