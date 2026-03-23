"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Match } from "@/lib/matches";
import { codeToFlag } from "@/lib/flags";

interface MatchesClientProps {
  matches: Match[];
  groups: string[];
}

// Group colors for pills
const GROUP_COLORS: Record<string, string> = {
  "Group A": "bg-red-500/20 text-red-300 border-red-500/30",
  "Group B": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Group C": "bg-green-500/20 text-green-300 border-green-500/30",
  "Group D": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Group E": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Group F": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Group G": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Group H": "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Group I": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Group J": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "Group K": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Group L": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

function getGroupColor(group: string | null): string {
  if (!group) return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
  return GROUP_COLORS[group] || "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
}

type StatusFilter = "all" | "live" | "upcoming" | "finished";

function getStatusLabel(
  status: Match["status"],
  t: ReturnType<typeof useTranslations<"matches">>
): string {
  switch (status) {
    case "live":
      return t("live");
    case "halftime":
      return t("halftime");
    case "finished":
      return t("finished");
    case "postponed":
      return t("postponed");
    default:
      return t("scheduled");
  }
}

function getStatusStyle(status: Match["status"]): string {
  switch (status) {
    case "live":
    case "halftime":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "finished":
      return "bg-zinc-600/20 text-zinc-400 border-zinc-600/40";
    case "postponed":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    default:
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
  }
}

export default function MatchesClient({ matches, groups }: MatchesClientProps) {
  const t = useTranslations("matches");
  const locale = useLocale();

  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  // Filter matches
  const filtered = useMemo(() => {
    return matches.filter((m) => {
      // Group filter
      if (groupFilter !== "all" && m.group_name !== groupFilter) return false;

      // Status filter
      if (statusFilter === "live" && m.status !== "live" && m.status !== "halftime")
        return false;
      if (statusFilter === "upcoming" && m.status !== "scheduled") return false;
      if (statusFilter === "finished" && m.status !== "finished") return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.home_team.toLowerCase().includes(q) &&
          !m.away_team.toLowerCase().includes(q) &&
          !m.home_code.toLowerCase().includes(q) &&
          !m.away_code.toLowerCase().includes(q)
        )
          return false;
      }

      return true;
    });
  }, [matches, groupFilter, statusFilter, search]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    for (const match of filtered) {
      const date = new Date(match.kickoff_at);
      const key = date.toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(match);
    }
    return groups;
  }, [filtered, locale]);

  const dateKeys = Object.keys(groupedByDate);

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800/50 px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-500">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[49px] z-10 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/40">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-zinc-900/80 border border-zinc-800/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Group tabs - horizontal scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            <button
              onClick={() => setGroupFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                groupFilter === "all"
                  ? "bg-white text-zinc-900"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {t("filterAll")}
            </button>
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setGroupFilter(group)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  groupFilter === group
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {group.replace("Group ", "")}
              </button>
            ))}
          </div>

          {/* Status filter + match count */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {(["all", "live", "upcoming", "finished"] as StatusFilter[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === status
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-zinc-800/40 text-zinc-500 hover:text-zinc-300 border border-transparent"
                    }`}
                  >
                    {status === "all"
                      ? t("filterAll")
                      : status === "live"
                        ? t("filterLive")
                        : status === "upcoming"
                          ? t("filterUpcoming")
                          : t("filterFinished")}
                  </button>
                )
              )}
            </div>
            <span className="text-xs text-zinc-600 flex-shrink-0">
              {t("matchCount", { count: filtered.length })}
            </span>
          </div>
        </div>
      </div>

      {/* Matches grouped by date */}
      <div className="max-w-4xl mx-auto">
        {dateKeys.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">{t("noResults")}</p>
          </div>
        )}

        {dateKeys.map((dateKey, dateIdx) => (
          <div
            key={dateKey}
            className={dateIdx % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/30"}
          >
            {/* Sticky date header */}
            <div className="sticky top-[185px] z-[5] backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/30 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-zinc-300 capitalize">
                {dateKey}
              </h2>
            </div>

            {/* Match cards */}
            <div className="px-4 py-3 space-y-2">
              {groupedByDate[dateKey].map((match) => (
                <MatchCard key={match.id} match={match} locale={locale} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding */}
      <div className="h-20" />
    </div>
  );
}

function MatchCard({
  match,
  locale,
  t,
}: {
  match: Match;
  locale: string;
  t: ReturnType<typeof useTranslations<"matches">>;
}) {
  const kickoffDate = new Date(match.kickoff_at);
  const timeStr = kickoffDate.toLocaleTimeString(
    locale === "es" ? "es-AR" : "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: false }
  );

  const isLive = match.status === "live" || match.status === "halftime";
  const isFinished = match.status === "finished";
  const showScore = isLive || isFinished;

  return (
    <Link href={`/${locale}/match/${match.id}`}>
      <div
        className={`group rounded-2xl border p-4 sm:p-5 transition-all duration-150 cursor-pointer ${
          isLive
            ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
            : "border-zinc-800/50 bg-zinc-900/60 hover:bg-zinc-800/60 hover:border-zinc-700/50"
        } active:scale-[0.98]`}
      >
        {/* Mobile layout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Time */}
          <div className="flex-shrink-0 w-14 sm:w-16 text-center">
            <div className="text-lg font-mono font-bold text-zinc-200">
              {timeStr}
            </div>
            {isLive && match.match_minute && (
              <div className="text-xs font-bold text-green-400 animate-pulse">
                {match.match_minute}&apos;
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-zinc-800 flex-shrink-0" />

          {/* Teams + Score */}
          <div className="flex-1 min-w-0">
            {/* Home team row */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base flex-shrink-0">
                {codeToFlag(match.home_code)}
              </span>
              <span className="text-xs font-bold text-zinc-400 w-8 flex-shrink-0">
                {match.home_code}
              </span>
              <span className="text-sm text-zinc-200 truncate flex-1">
                {match.home_team}
              </span>
              {showScore && (
                <span
                  className={`text-lg font-mono font-bold flex-shrink-0 ${
                    isLive ? "text-white" : "text-zinc-300"
                  }`}
                >
                  {match.home_score}
                </span>
              )}
            </div>
            {/* Away team row */}
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">
                {codeToFlag(match.away_code)}
              </span>
              <span className="text-xs font-bold text-zinc-400 w-8 flex-shrink-0">
                {match.away_code}
              </span>
              <span className="text-sm text-zinc-200 truncate flex-1">
                {match.away_team}
              </span>
              {showScore && (
                <span
                  className={`text-lg font-mono font-bold flex-shrink-0 ${
                    isLive ? "text-white" : "text-zinc-300"
                  }`}
                >
                  {match.away_score}
                </span>
              )}
            </div>
          </div>

          {/* Right side: Group + Status */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            {match.group_name && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getGroupColor(
                  match.group_name
                )}`}
              >
                {match.group_name.replace("Group ", "")}
              </span>
            )}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusStyle(
                match.status
              )}`}
            >
              {getStatusLabel(match.status, t)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
