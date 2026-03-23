"use client";

import { useState, useMemo, useCallback } from "react";
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
  "Group A": "bg-red-50 text-red-700 border-red-200",
  "Group B": "bg-blue-50 text-blue-700 border-blue-200",
  "Group C": "bg-green-50 text-green-700 border-green-200",
  "Group D": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Group E": "bg-purple-50 text-purple-700 border-purple-200",
  "Group F": "bg-pink-50 text-pink-700 border-pink-200",
  "Group G": "bg-orange-50 text-orange-700 border-orange-200",
  "Group H": "bg-teal-50 text-teal-700 border-teal-200",
  "Group I": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Group J": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Group K": "bg-amber-50 text-amber-700 border-amber-200",
  "Group L": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function getGroupColor(group: string | null): string {
  if (!group) return "bg-zinc-100 text-zinc-600 border-zinc-200";
  return GROUP_COLORS[group] || "bg-zinc-100 text-zinc-600 border-zinc-200";
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
      return "bg-green-50 text-green-700 border-green-200";
    case "finished":
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    case "postponed":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default:
      return "bg-blue-50 text-blue-600 border-blue-200";
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
    <div className="min-h-screen pt-16 bg-white">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800/50 px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">
            {t("title")}
          </h1>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[49px] z-10 bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-sm">
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
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition-colors"
            />
          </div>

          {/* Group tabs - horizontal scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            <button
              onClick={() => setGroupFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                groupFilter === "all"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
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
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
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
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "bg-zinc-50 text-zinc-500 hover:text-zinc-700 border border-zinc-200"
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
            <span className="text-xs text-zinc-400 flex-shrink-0">
              {t("matchCount", { count: filtered.length })}
            </span>
          </div>
        </div>
      </div>

      {/* Matches grouped by date */}
      <div className="max-w-4xl mx-auto">
        {dateKeys.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-lg">{t("noResults")}</p>
          </div>
        )}

        {dateKeys.map((dateKey, dateIdx) => (
          <div
            key={dateKey}
            className={dateIdx % 2 === 0 ? "bg-white" : "bg-zinc-50"}
          >
            {/* Sticky date header */}
            <div className="sticky top-[185px] z-[5] backdrop-blur-md bg-white/90 border-b border-zinc-200 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-zinc-700 capitalize">
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
            ? "border-green-300 bg-green-50 hover:bg-green-100"
            : "border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300"
        } active:scale-[0.98] shadow-sm`}
      >
        {/* Mobile layout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Time */}
          <div className="flex-shrink-0 w-14 sm:w-16 text-center">
            <div className="text-lg font-mono font-bold text-zinc-800">
              {timeStr}
            </div>
            {isLive && match.match_minute && (
              <div className="text-xs font-bold text-green-400 animate-pulse">
                {match.match_minute}&apos;
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-zinc-200 flex-shrink-0" />

          {/* Teams + Score */}
          <div className="flex-1 min-w-0">
            {/* Home team row */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base flex-shrink-0">
                {codeToFlag(match.home_code)}
              </span>
              <span className="text-xs font-bold text-zinc-500 w-8 flex-shrink-0">
                {match.home_code}
              </span>
              <span className="text-sm text-zinc-800 truncate flex-1 font-medium">
                {match.home_team}
              </span>
              {showScore && (
                <span
                  className={`text-lg font-mono font-bold flex-shrink-0 ${
                    isLive ? "text-zinc-900" : "text-zinc-600"
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
              <span className="text-xs font-bold text-zinc-500 w-8 flex-shrink-0">
                {match.away_code}
              </span>
              <span className="text-sm text-zinc-800 truncate flex-1 font-medium">
                {match.away_team}
              </span>
              {showScore && (
                <span
                  className={`text-lg font-mono font-bold flex-shrink-0 ${
                    isLive ? "text-zinc-900" : "text-zinc-600"
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

        {/* "Who do you support?" quick pick */}
        {match.status === "scheduled" && (
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">{t("whoDoYouSupport")}</span>
            <div className="flex gap-2">
              <TeamPickButton code={match.home_code} matchId={match.id} />
              <TeamPickButton code={match.away_code} matchId={match.id} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function TeamPickButton({ code, matchId }: { code: string; matchId: string }) {
  const [picked, setPicked] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`matchfeel_pick_${matchId}`) === code;
  });

  const handlePick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(`matchfeel_pick_${matchId}`, code);
    setPicked(true);
  }, [code, matchId]);

  return (
    <button
      onClick={handlePick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
        picked
          ? "bg-orange-500 text-white shadow-sm"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 border border-zinc-200"
      }`}
    >
      <span className="text-sm">{codeToFlag(code)}</span>
      {code}
    </button>
  );
}
