"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Match } from "@/lib/matches";
import MatchCard from "./MatchCard";

interface FixtureDrawerProps {
  live: Match[];
  upcoming: Match[];
  finished: Match[];
}

export default function FixtureDrawer({ live, upcoming, finished }: FixtureDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("fixture");
  const tHome = useTranslations("home");

  const totalMatches = live.length + upcoming.length + finished.length;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        expanded ? "h-[60vh]" : "h-16"
      }`}
    >
      <div className="h-full flex flex-col backdrop-blur-xl bg-zinc-950/90 border-t border-zinc-800/40 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        {/* Drag handle / header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 flex flex-col items-center w-full px-4 pt-3 pb-3 cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-t-3xl"
          aria-label={expanded ? "Collapse fixture drawer" : "Expand fixture drawer"}
        >
          <div className="w-12 h-1.5 rounded-full bg-zinc-600 mb-2" />
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-zinc-100">
              {tHome("worldCup")} — {totalMatches} {t("matches")}
            </span>
            {live.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                {live.length} {t("live")}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>

        {/* Scrollable match list */}
        {expanded && (
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 animate-fade-in">
            {/* Live matches */}
            {live.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    {t("live")}
                  </h3>
                  <div className="flex-1 h-px bg-zinc-800/60" />
                </div>
                <div className="space-y-2">
                  {live.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming matches */}
            {upcoming.length > 0 && (
              <section className={live.length > 0 ? "mt-5" : ""}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {t("upcoming")}
                  </h3>
                  <div className="flex-1 h-px bg-zinc-800/60" />
                </div>
                <div className="space-y-2">
                  {upcoming.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Finished matches */}
            {finished.length > 0 && (
              <section className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {t("finished")}
                  </h3>
                  <div className="flex-1 h-px bg-zinc-800/60" />
                </div>
                <div className="space-y-2">
                  {finished.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {totalMatches === 0 && (
              <p className="text-center text-zinc-500 py-8">
                {t("noMatches")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
