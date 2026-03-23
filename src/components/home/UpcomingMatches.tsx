"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Match } from "@/lib/matches";
import { codeToFlag } from "@/lib/flags";

interface UpcomingMatchesProps {
  matches: Match[];
}

function getRelativeDay(kickoff: string, t: ReturnType<typeof useTranslations<"home">>) {
  const kickoffDate = new Date(kickoff);
  const now = new Date();
  const diffMs = kickoffDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return t("today");
  if (diffDays === 1) return t("tomorrow");
  return t("inDays", { days: diffDays });
}

export default function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const t = useTranslations("home");
  const locale = useLocale();

  if (matches.length === 0) return null;

  const display = matches.slice(0, 10);

  return (
    <section id="upcoming" className="relative bg-zinc-950 py-20 px-6 scroll-mt-4">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 text-center mb-12">
          {t("upcomingTitle")}
        </h2>

        {/* Match list */}
        <div className="space-y-3">
          {display.map((match) => {
            const kickoffDate = new Date(match.kickoff_at);
            const timeStr = kickoffDate.toLocaleTimeString(locale === "es" ? "es-AR" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const dateStr = kickoffDate.toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });

            return (
              <Link key={match.id} href={`/${locale}/match/${match.id}`}>
                <div className="flex items-center gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/80 backdrop-blur-sm p-5 hover:bg-zinc-800/60 hover:border-zinc-700/50 active:scale-[0.98] transition-all duration-150 cursor-pointer">
                  {/* Date/time */}
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-xs text-zinc-500 capitalize">{dateStr}</div>
                    <div className="text-lg font-mono font-bold text-zinc-200">{timeStr}</div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-10 bg-zinc-800" />

                  {/* Teams */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base">{codeToFlag(match.home_code)}</span>
                      <span className="text-sm font-bold text-zinc-100 tracking-wide">{match.home_code}</span>
                      <span className="text-xs text-zinc-600 font-medium">vs</span>
                      <span className="text-sm font-bold text-zinc-100 tracking-wide">{match.away_code}</span>
                      <span className="text-base">{codeToFlag(match.away_code)}</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {match.home_team} vs {match.away_team}
                    </div>
                  </div>

                  {/* Group & relative time */}
                  <div className="flex-shrink-0 text-right">
                    {(match.group_name || match.round) && (
                      <div className="text-xs font-semibold text-orange-400/90 uppercase tracking-wider mb-1">
                        {match.group_name ?? match.round}
                      </div>
                    )}
                    <div className="text-xs text-zinc-500">
                      {getRelativeDay(match.kickoff_at, t)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/matches`}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {t("viewAllMatches")} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
