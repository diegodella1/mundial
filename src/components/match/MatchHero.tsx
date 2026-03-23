"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Flag from "@/components/ui/Flag";
import { createClient } from "@/lib/supabase/client";

interface MatchHeroProps {
  matchId: string;
  homeCode: string;
  awayCode: string;
}

interface Bubble {
  id: number;
  emoji: string;
  side: "left" | "right";
  x: number; // percentage within the side (0-100)
  createdAt: number;
}

const DEMO_EMOJIS = ["\u26BD", "\uD83D\uDD25", "\uD83D\uDE31", "\uD83C\uDF89", "\uD83E\uDD2C", "\uD83E\uDD26", "\uD83D\uDE24"];
const BUBBLE_LIFETIME = 1800; // ms
const MAX_BUBBLES = 10;

let bubbleIdCounter = 0;

export default function MatchHero({ matchId, homeCode, awayCode }: MatchHeroProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const hasRealData = useRef(false);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add a bubble to the state
  const addBubble = useCallback((emoji: string, side: "left" | "right") => {
    const newBubble: Bubble = {
      id: bubbleIdCounter++,
      emoji,
      side,
      x: 15 + Math.random() * 70, // 15-85% within the side
      createdAt: Date.now(),
    };

    setBubbles((prev) => {
      const next = [...prev, newBubble];
      // Keep max bubbles
      if (next.length > MAX_BUBBLES) {
        return next.slice(next.length - MAX_BUBBLES);
      }
      return next;
    });
  }, []);

  // Clean up expired bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBubbles((prev) => prev.filter((b) => now - b.createdAt < BUBBLE_LIFETIME));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Demo bubbles when no real data
  useEffect(() => {
    function scheduleDemoBubble() {
      const delay = 1500 + Math.random() * 2000; // 1.5-3.5s
      demoTimerRef.current = setTimeout(() => {
        if (!hasRealData.current) {
          const emoji = DEMO_EMOJIS[Math.floor(Math.random() * DEMO_EMOJIS.length)];
          const side = Math.random() < 0.5 ? "left" : "right";
          addBubble(emoji, side as "left" | "right");
        }
        scheduleDemoBubble();
      }, delay);
    }

    scheduleDemoBubble();

    return () => {
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    };
  }, [addBubble]);

  // Subscribe to realtime broadcast channel for this match
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`match_${matchId}`)
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        if (!payload) return;
        hasRealData.current = true;

        const { emoji, team_supported } = payload as {
          emoji: string;
          team_supported?: string;
          country_code?: string;
        };

        // Determine side: if team_supported matches home or away
        let side: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
        if (team_supported) {
          if (team_supported === homeCode) side = "left";
          else if (team_supported === awayCode) side = "right";
        }

        addBubble(emoji || "\u26BD", side);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, homeCode, awayCode, addBubble]);

  const homeBubbles = bubbles.filter((b) => b.side === "left");
  const awayBubbles = bubbles.filter((b) => b.side === "right");

  return (
    <div className="h-[35vh] flex-shrink-0 relative overflow-hidden">
      {/* Gradient overlay: transparent at top, dark at bottom to blend into content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/95 pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex items-end pb-6">
        <div className="w-full flex items-end justify-between px-6 sm:px-10">
          {/* Home team side */}
          <div className="flex-1 flex flex-col items-center relative">
            {/* Bubble zone */}
            <div className="relative w-full h-24 mb-2">
              {homeBubbles.map((b) => (
                <span
                  key={b.id}
                  className="absolute animate-bubble-up pointer-events-none"
                  style={{
                    left: `${b.x}%`,
                    bottom: 0,
                    fontSize: "1.5rem",
                  }}
                >
                  {b.emoji}
                </span>
              ))}
            </div>
            <Flag code={homeCode} size="xl" />
            <span className="text-lg font-bold text-zinc-100 tracking-widest uppercase mt-1">
              {homeCode}
            </span>
          </div>

          {/* VS divider */}
          <div className="flex-shrink-0 flex flex-col items-center justify-end pb-4 mx-4">
            <span className="text-zinc-600 text-sm font-medium uppercase tracking-wider">vs</span>
          </div>

          {/* Away team side */}
          <div className="flex-1 flex flex-col items-center relative">
            {/* Bubble zone */}
            <div className="relative w-full h-24 mb-2">
              {awayBubbles.map((b) => (
                <span
                  key={b.id}
                  className="absolute animate-bubble-up pointer-events-none"
                  style={{
                    left: `${b.x}%`,
                    bottom: 0,
                    fontSize: "1.5rem",
                  }}
                >
                  {b.emoji}
                </span>
              ))}
            </div>
            <Flag code={awayCode} size="xl" />
            <span className="text-lg font-bold text-zinc-100 tracking-widest uppercase mt-1">
              {awayCode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
