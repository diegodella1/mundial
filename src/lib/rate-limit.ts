const limits = new Map<string, number>();

export function checkRateLimit(key: string, intervalMs: number): boolean {
  const now = Date.now();
  const last = limits.get(key) || 0;
  if (now - last < intervalMs) return false;
  limits.set(key, now);
  return true;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 120_000;
    for (const [key, ts] of limits) {
      if (ts < cutoff) limits.delete(key);
    }
  }, 300_000);
}
