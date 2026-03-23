"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Match } from "@/lib/matches";

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
  const tFixture = useTranslations("fixture");
  const locale = useLocale();

  if (matches.length === 0) return null;

  const display = matches.slice(0, 5);

  return (
    <section className="relative px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-xl font-bold text-zinc-100">
            {t("upcomingTitle")}
          </h2>
          <div className="flex-1 h-px bg-zinc-800/60" />
        </div>

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
              day: "numeric",
              month: "short",
            });

            return (
              <Link key={match.id} href={`/${locale}/match/${match.id}`}>
                <div className="flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/60 backdrop-blur-sm p-4 hover:bg-zinc-800/60 hover:border-zinc-700/50 active:scale-[0.98] transition-all duration-150 cursor-pointer">
                  {/* Date/time */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-xs text-zinc-500">{dateStr}</div>
                    <div className="text-sm font-mono font-semibold text-zinc-300">{timeStr}</div>
                  </div>

                  {/* Teams */}
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <span className="text-sm font-bold text-zinc-100 tracking-wide">{match.home_code}</span>
                    <span className="text-xs text-zinc-600">vs</span>
                    <span className="text-sm font-bold text-zinc-100 tracking-wide">{match.away_code}</span>
                  </div>

                  {/* Group & relative time */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-zinc-500">{match.group_name ?? match.round ?? ""}</div>
                    <div className="text-xs text-orange-400/80 font-medium">
                      {getRelativeDay(match.kickoff_at, t)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-zinc-500 cursor-default">
            {t("viewAllMatches")} &rarr;
          </span>
        </div>
      </div>
    </section>
  );
}
