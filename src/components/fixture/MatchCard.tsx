"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Match } from "@/lib/matches";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const locale = useLocale();
  const t = useTranslations("fixture");
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinished = match.status === "finished";
  const hasScore = isLive || isFinished;

  const kickoffDate = new Date(match.kickoff_at);
  const timeStr = kickoffDate.toLocaleTimeString(locale === "es" ? "es-AR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateStr = kickoffDate.toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "short",
  });

  return (
    <Link href={`/${locale}/match/${match.id}`}>
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 min-h-[44px] hover:bg-zinc-800/80 hover:border-zinc-700/50 active:scale-[0.98] transition-all duration-150 cursor-pointer">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">
            {match.group_name ?? match.round ?? ""}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] rounded-full px-2 py-0.5 bg-red-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              {t("live")}
            </span>
          )}
          {isFinished && (
            <span className="text-xs font-medium text-zinc-500">
              {t("final")}
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="text-xs text-zinc-500">
              {dateStr} {timeStr}
            </span>
          )}
        </div>

        {/* Teams and score */}
        <div className="flex items-center justify-between gap-3">
          {/* Home team */}
          <div className="flex-1 text-left">
            <span className="text-sm font-bold text-zinc-100 tracking-wide">
              {match.home_code}
            </span>
            <span className="ml-2 text-xs text-zinc-500 hidden sm:inline">
              {match.home_team}
            </span>
          </div>

          {/* Score */}
          <div className={`flex items-center gap-2 font-mono font-bold tabular-nums ${isLive ? "text-xl" : "text-lg"}`}>
            {hasScore ? (
              <>
                <span className="text-zinc-100">{match.home_score}</span>
                <span className="text-zinc-600">-</span>
                <span className="text-zinc-100">{match.away_score}</span>
              </>
            ) : (
              <span className="text-zinc-600 text-sm">vs</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 text-right">
            <span className="text-xs text-zinc-500 hidden sm:inline mr-2">
              {match.away_team}
            </span>
            <span className="text-sm font-bold text-zinc-100 tracking-wide">
              {match.away_code}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
