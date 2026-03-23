export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Start aggregation cron
    const { startAggregationCron } = await import("./lib/aggregation-cron");
    startAggregationCron();
  }
}
