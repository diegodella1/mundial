import { useLocale, useTranslations } from "next-intl";
import type { Match } from "@/lib/matches";

interface ScoreHeaderProps {
  match: Match;
}

export default function ScoreHeader({ match }: ScoreHeaderProps) {
  const locale = useLocale();
  const t = useTranslations("match");
  const tFixture = useTranslations("fixture");

  const isLive = match.status === "live" || match.status === "halftime";
  const isFinished = match.status === "finished";
  const hasScore = isLive || isFinished;

  const kickoffDate = new Date(match.kickoff_at);
  const timeStr = kickoffDate.toLocaleTimeString(
    locale === "es" ? "es-AR" : "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  );

  return (
    <div className="text-center space-y-3">
      {/* Group / Round badge — above score */}
      {(match.group_name || match.round) && (
        <span className="inline-block bg-zinc-800/80 text-zinc-400 px-3 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider">
          {match.group_name ?? match.round}
        </span>
      )}

      {/* Score */}
      <div className="flex items-center justify-center gap-5">
        <div className="flex-1 text-right">
          <span className="text-xl font-bold text-zinc-100 tracking-widest uppercase">
            {match.home_code}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums min-w-[120px] justify-center">
          {hasScore ? (
            <>
              <span className="text-5xl font-bold text-zinc-50">{match.home_score}</span>
              <span className="text-2xl text-zinc-600 font-light">-</span>
              <span className="text-5xl font-bold text-zinc-50">{match.away_score}</span>
            </>
          ) : (
            <span className="text-zinc-600 text-xl">vs</span>
          )}
        </div>

        <div className="flex-1 text-left">
          <span className="text-xl font-bold text-zinc-100 tracking-widest uppercase">
            {match.away_code}
          </span>
        </div>
      </div>

      {/* Status line */}
      <div className="flex items-center justify-center gap-2">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            {match.match_minute != null
              ? `${match.match_minute} ${t("minute")}`
              : tFixture("live")}
          </span>
        )}
        {isFinished && (
          <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {tFixture("final")}
          </span>
        )}
        {!isLive && !isFinished && (
          <span className="text-zinc-500 text-sm">{timeStr}</span>
        )}
      </div>

      {/* Subtle divider */}
      <div className="mx-auto w-24 h-px bg-zinc-800" />
    </div>
  );
}
