"use client";

import { useState } from "react";
import type { Match } from "@/lib/matches";
import ScoreHeader from "@/components/match/ScoreHeader";
import TeamSelector from "@/components/match/TeamSelector";
import ReactionBar from "@/components/match/ReactionBar";

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
}

export default function MatchPageClient({
  match,
  reactions,
  initialTeamCode,
  isLoggedIn,
}: MatchPageClientProps) {
  const [teamCode, setTeamCode] = useState<string | null>(initialTeamCode);

  return (
    <div className="max-w-lg mx-auto space-y-6">
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

      <ReactionBar
        matchId={match.id}
        teamSupported={teamCode}
        reactions={reactions}
      />
    </div>
  );
}
