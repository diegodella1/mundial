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
    <div className="text-center space-y-2">
      {/* Status line */}
      <div className="flex items-center justify-center gap-2 text-xs">
        {isLive && (
          <span className="flex items-center gap-1.5 font-bold text-red-500">
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
          <span className="font-bold text-zinc-400 uppercase">
            {tFixture("final")}
          </span>
        )}
        {!isLive && !isFinished && (
          <span className="text-zinc-500">{timeStr}</span>
        )}
      </div>

      {/* Group / Round */}
      {(match.group_name || match.round) && (
        <p className="text-xs text-zinc-500">
          {match.group_name ?? match.round}
        </p>
      )}

      {/* Score */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 text-right">
          <span className="text-2xl font-bold text-zinc-100 tracking-wide">
            {match.home_code}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-3xl font-bold tabular-nums min-w-[100px] justify-center">
          {hasScore ? (
            <>
              <span className="text-zinc-100">{match.home_score}</span>
              <span className="text-zinc-600">-</span>
              <span className="text-zinc-100">{match.away_score}</span>
            </>
          ) : (
            <span className="text-zinc-600 text-xl">vs</span>
          )}
        </div>

        <div className="flex-1 text-left">
          <span className="text-2xl font-bold text-zinc-100 tracking-wide">
            {match.away_code}
          </span>
        </div>
      </div>
    </div>
  );
}
