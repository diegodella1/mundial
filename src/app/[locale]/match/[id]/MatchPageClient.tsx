"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { Match } from "@/lib/matches";
import ScoreHeader from "@/components/match/ScoreHeader";
import TeamSelector from "@/components/match/TeamSelector";
import ReactionBar, { type ReactionDetail } from "@/components/match/ReactionBar";
import ChatBox from "@/components/match/ChatBox";
import TweetPrompt from "@/components/match/TweetPrompt";

interface ReactionConfig {
  id: string;
  emoji: string;
  label_es: string;
  label_en: string;
  sponsor_id: string | null;
}

interface MatchPageClientProps {
  match: Match;
  reactions: ReactionConfig[];
  initialTeamCode: string | null;
  isLoggedIn: boolean;
  chatEnabled: boolean;
  userCountryFromProfile: string | null;
}

type Tab = "reactions" | "chat";

export default function MatchPageClient({
  match,
  reactions,
  initialTeamCode,
  isLoggedIn,
  chatEnabled,
  userCountryFromProfile,
}: MatchPageClientProps) {
  const [teamCode, setTeamCode] = useState<string | null>(initialTeamCode);
  const [activeTab, setActiveTab] = useState<Tab>("reactions");
  const [userCountry, setUserCountry] = useState<string | null>(
    userCountryFromProfile
  );
  const [lastReaction, setLastReaction] = useState<ReactionDetail | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const locale = useLocale();
  const t = useTranslations("match");

  const handleReactionSuccess = useCallback((detail: ReactionDetail) => {
    setLastReaction(detail);
    setReactionCount((c) => c + 1);
  }, []);

  // On mount, check localStorage for anonymous country
  useEffect(() => {
    if (!isLoggedIn && !userCountry) {
      const stored = localStorage.getItem("matchfeel_country");
      if (stored) setUserCountry(stored);
    }
  }, [isLoggedIn, userCountry]);

  return (
    <div className="max-w-lg mx-auto pb-20 md:pb-0">
      {/* Back arrow */}
      <div className="mb-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("backToHome")}
        </Link>
      </div>

      {/* Sticky score header */}
      <div className="sticky top-[52px] z-10 bg-zinc-950/90 backdrop-blur-lg -mx-4 px-4 py-3 rounded-b-xl">
        <ScoreHeader match={match} />
      </div>

      <div className="mt-6 space-y-6">
        {isLoggedIn && !teamCode && (
          <TeamSelector
            matchId={match.id}
            homeTeam={match.home_team}
            homeCode={match.home_code}
            awayTeam={match.away_team}
            awayCode={match.away_code}
            onSelect={setTeamCode}
          />
        )}

        {/* Desktop tab switcher — hidden on mobile (bottom bar takes over) */}
        <div className="hidden md:flex rounded-xl bg-zinc-900/80 border border-zinc-800/50 p-1">
          <button
            onClick={() => setActiveTab("reactions")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === "reactions"
                ? "bg-zinc-700 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t("reactionsTitle")}
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-zinc-700 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t("chat")}
          </button>
        </div>

        {/* Content */}
        <div key={activeTab} className="animate-fade-in">
          {activeTab === "reactions" ? (
            <ReactionBar
              matchId={match.id}
              teamSupported={teamCode}
              reactions={reactions}
              isAuthenticated={isLoggedIn}
              userCountry={userCountry}
              onReactionSuccess={handleReactionSuccess}
            />
          ) : (
            <ChatBox matchId={match.id} chatEnabled={chatEnabled} />
          )}
        </div>
      </div>

      {/* Tweet share prompt */}
      <TweetPrompt
        matchContext={{
          matchId: match.id,
          homeTeam: match.home_team,
          awayTeam: match.away_team,
          homeCode: match.home_code,
          awayCode: match.away_code,
          matchMinute: match.match_minute,
        }}
        lastReaction={lastReaction}
        reactionCount={reactionCount}
      />

      {/* Mobile bottom tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden flex border-t border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <button
          onClick={() => setActiveTab("reactions")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "reactions" ? "text-white" : "text-zinc-500"
          }`}
        >
          <span className="text-lg">&#9917;</span>
          {t("reactionsTitle")}
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
            activeTab === "chat" ? "text-white" : "text-zinc-500"
          }`}
        >
          <span className="text-lg">&#128172;</span>
          {t("chat")}
        </button>
      </div>
    </div>
  );
}
