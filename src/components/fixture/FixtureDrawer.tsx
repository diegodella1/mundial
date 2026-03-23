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
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out ${
        expanded ? "h-[60vh]" : "h-16"
      }`}
    >
      <div className="h-full flex flex-col bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800 rounded-t-2xl">
        {/* Drag handle / header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 flex flex-col items-center w-full px-4 pt-2 pb-3 cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-zinc-600 mb-2" />
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold text-zinc-100">
              {tHome("worldCup")} — {totalMatches} {t("matches")}
            </span>
            {live.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {live.length} {t("live")}
              </span>
            )}
            <svg
              className={`w-5 h-5 text-zinc-400 transition-transform ${
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
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
            {/* Live matches */}
            {live.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                  {t("live")}
                </h3>
                <div className="space-y-2">
                  {live.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming matches */}
            {upcoming.length > 0 && (
              <section className={live.length > 0 ? "mt-4" : ""}>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  {t("upcoming")}
                </h3>
                <div className="space-y-2">
                  {upcoming.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            {/* Finished matches */}
            {finished.length > 0 && (
              <section className="mt-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  {t("finished")}
                </h3>
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
