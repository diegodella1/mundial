"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface TeamSelectorProps {
  matchId: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  onSelect: (code: string) => void;
}

export default function TeamSelector({
  matchId,
  homeTeam,
  homeCode,
  awayTeam,
  awayCode,
  onSelect,
}: TeamSelectorProps) {
  const t = useTranslations("match");
  const [loading, setLoading] = useState(false);

  async function handleSelect(teamCode: string) {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase.from("user_match_teams").insert({
        user_id: user.id,
        match_id: matchId,
        team_code: teamCode,
      });

      onSelect(teamCode);
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-zinc-400">
        {t("chooseTeam")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSelect(homeCode)}
          disabled={loading}
          className="flex flex-col items-center gap-1 rounded-xl bg-zinc-800/80 p-4 transition hover:bg-zinc-700/80 active:scale-95 disabled:opacity-50"
        >
          <span className="text-2xl font-bold text-zinc-100">{homeCode}</span>
          <span className="text-xs text-zinc-400">{homeTeam}</span>
        </button>

        <button
          onClick={() => handleSelect(awayCode)}
          disabled={loading}
          className="flex flex-col items-center gap-1 rounded-xl bg-zinc-800/80 p-4 transition hover:bg-zinc-700/80 active:scale-95 disabled:opacity-50"
        >
          <span className="text-2xl font-bold text-zinc-100">{awayCode}</span>
          <span className="text-xs text-zinc-400">{awayTeam}</span>
        </button>
      </div>
    </div>
  );
}
