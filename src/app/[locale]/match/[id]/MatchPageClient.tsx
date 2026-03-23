"use client";

import { useState } from "react";
import type { Match } from "@/lib/matches";
import ScoreHeader from "@/components/match/ScoreHeader";
import TeamSelector from "@/components/match/TeamSelector";
import ReactionBar from "@/components/match/ReactionBar";
import ChatBox from "@/components/match/ChatBox";

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
}

type Tab = "reactions" | "chat";

export default function MatchPageClient({
  match,
  reactions,
  initialTeamCode,
  isLoggedIn,
  chatEnabled,
}: MatchPageClientProps) {
  const [teamCode, setTeamCode] = useState<string | null>(initialTeamCode);
  const [activeTab, setActiveTab] = useState<Tab>("reactions");

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <ScoreHeader match={match} />

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

      {/* Tab switcher — pill-style */}
      <div className="flex rounded-xl bg-zinc-900/80 border border-zinc-800/50 p-1">
        <button
          onClick={() => setActiveTab("reactions")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "reactions"
              ? "bg-zinc-700 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Reacciones
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "chat"
              ? "bg-zinc-700 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Chat
        </button>
      </div>

      {/* Content with fade-in on tab switch */}
      <div key={activeTab} className="animate-fade-in">
        {activeTab === "reactions" ? (
          <ReactionBar
            matchId={match.id}
            teamSupported={teamCode}
            reactions={reactions}
          />
        ) : (
          <ChatBox matchId={match.id} chatEnabled={chatEnabled} />
        )}
      </div>
    </div>
  );
}
