"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale } from "next-intl";
import ReactionFlyUp from "./ReactionFlyUp";

interface ReactionConfig {
  id: string;
  emoji: string;
  label_es: string;
  label_en: string;
  sponsor_id: string | null;
}

interface ReactionBarProps {
  matchId: string;
  teamSupported: string | null;
  reactions: ReactionConfig[];
}

interface FlyUp {
  id: number;
  emoji: string;
  buttonIndex: number;
}

export default function ReactionBar({
  matchId,
  teamSupported,
  reactions,
}: ReactionBarProps) {
  const locale = useLocale();
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});
  const [flyUps, setFlyUps] = useState<FlyUp[]>([]);
  const flyUpIdRef = useRef(0);

  const handleReaction = useCallback(
    async (reaction: ReactionConfig, buttonIndex: number) => {
      if (cooldowns[reaction.id]) return;

      // Haptic feedback
      navigator.vibrate?.(50);

      // Add fly-up animation
      const flyId = flyUpIdRef.current++;
      setFlyUps((prev) => [
        ...prev,
        { id: flyId, emoji: reaction.emoji, buttonIndex },
      ]);

      // Set cooldown
      setCooldowns((prev) => ({ ...prev, [reaction.id]: true }));
      setTimeout(() => {
        setCooldowns((prev) => ({ ...prev, [reaction.id]: false }));
      }, 1000);

      // Send reaction
      try {
        await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            match_id: matchId,
            reaction_type: reaction.id,
            team_supported: teamSupported,
          }),
        });
      } catch {
        // Silently fail — UX already shown
      }
    },
    [cooldowns, matchId, teamSupported]
  );

  const removeFlyUp = useCallback((id: number) => {
    setFlyUps((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2">
      {reactions.map((reaction, index) => {
        const label =
          locale === "es" ? reaction.label_es : reaction.label_en;
        const isDisabled = cooldowns[reaction.id];

        return (
          <div key={reaction.id} className="relative">
            {/* Fly-up animations for this button */}
            {flyUps
              .filter((f) => f.buttonIndex === index)
              .map((f) => (
                <ReactionFlyUp
                  key={f.id}
                  emoji={f.emoji}
                  onComplete={() => removeFlyUp(f.id)}
                />
              ))}

            <button
              onClick={() => handleReaction(reaction, index)}
              disabled={isDisabled}
              className={`relative flex flex-col items-center gap-1 w-full rounded-xl bg-zinc-800/60 p-3 transition active:scale-90 ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-zinc-700/60"
              }`}
            >
              {/* Sponsored indicator */}
              {reaction.sponsor_id && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
              )}

              <span className="text-2xl leading-none">{reaction.emoji}</span>
              <span className="text-[10px] font-medium text-zinc-400 leading-tight truncate w-full text-center">
                {label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
