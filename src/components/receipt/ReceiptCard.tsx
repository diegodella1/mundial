"use client";

import { useRef } from "react";
import type { ReceiptData } from "@/lib/receipts";

const REACTION_COLORS: Record<string, string> = {
  "\u26BD": "#22c55e",
  "\uD83D\uDD25": "#f97316",
  "\uD83D\uDE31": "#3b82f6",
  "\uD83E\uDD2C": "#ef4444",
  "\uD83D\uDFE5": "#dc2626",
  "\uD83E\uDD26": "#a855f7",
  "\uD83D\uDE24": "#eab308",
  "\uD83C\uDF89": "#06b6d4",
};

interface ReceiptCardProps {
  data: ReceiptData;
  matchId: string;
}

export default function ReceiptCard({ data, matchId }: ReceiptCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { match, teamSupported, topReactions, highlightMinute, countryComparison, totalReactions, totalUsers } = data;

  async function handleShare() {
    const shareData = {
      title: "Mi receipt de Matchfeel",
      text: `${match.home_team} ${match.home_score}-${match.away_score} ${match.away_team}`,
      url: `${window.location.origin}/es/match/${matchId}/receipt`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        alert("Copiado al portapapeles");
      } catch {
        // Clipboard failed
      }
    }
  }

  const matchDate = new Date(match.kickoff_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4">
      {/* Card */}
      <div
        ref={cardRef}
        className="w-full max-w-[360px] rounded-2xl p-[1.5px] bg-gradient-to-br from-orange-500 via-purple-500 to-pink-500"
      >
        <div className="rounded-[14px] bg-gradient-to-b from-zinc-900 to-zinc-800 p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono font-semibold bg-clip-text text-transparent bg-gradient-to-r from-zinc-400 to-zinc-600">
              Matchfeel Receipt
            </p>
            <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
              {matchDate}
            </p>
          </div>

          {/* Score */}
          <div className="text-center py-3">
            <div className="flex items-center justify-center gap-4">
              <div className="text-right flex-1">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">
                  {match.home_code}
                </p>
                <p className="text-sm text-zinc-300">{match.home_team}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-white tabular-nums">
                  {match.home_score}
                </span>
                <span className="text-lg text-zinc-600">-</span>
                <span className="text-4xl font-bold text-white tabular-nums">
                  {match.away_score}
                </span>
              </div>
              <div className="text-left flex-1">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">
                  {match.away_code}
                </p>
                <p className="text-sm text-zinc-300">{match.away_team}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-zinc-700" />

          {/* Team supported */}
          {teamSupported && (
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Tu equipo
              </p>
              <p className="text-lg font-bold text-white mt-0.5">
                {teamSupported}
              </p>
            </div>
          )}

          {/* Top reactions */}
          {topReactions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Tus reacciones
              </p>
              <div className="space-y-2">
                {topReactions.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: REACTION_COLORS[r.emoji] || "#71717a" }}
                    />
                    <span className="text-2xl">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300">{r.label}</p>
                      {r.minutes.length > 0 && (
                        <p className="text-[10px] text-zinc-500 truncate">
                          min {r.minutes.slice(0, 5).join(", ")}
                          {r.minutes.length > 5 ? "..." : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-mono text-zinc-400">
                      x{r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlight minute */}
          {highlightMinute && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Tu momento
              </p>
              <div className="bg-zinc-800/50 rounded-lg px-3 py-2 flex items-center gap-3">
                <span className="text-2xl">{highlightMinute.emoji}</span>
                <div>
                  <p className="text-sm text-white">
                    Minuto {highlightMinute.minute}&apos;
                  </p>
                  {highlightMinute.event && (
                    <p className="text-[10px] text-zinc-400">
                      {highlightMinute.event}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Country comparison */}
          {countryComparison && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Tu pais vs el mundo
              </p>
              <div className="flex items-center justify-around bg-zinc-800/50 rounded-lg px-3 py-2">
                <div className="text-center">
                  <p className="text-2xl">{countryComparison.userTopEmoji}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {countryComparison.userCountry}
                  </p>
                </div>
                <span className="text-zinc-600 text-xs">vs</span>
                <div className="text-center">
                  <p className="text-2xl">{countryComparison.globalTopEmoji}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Mundo</p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-dashed border-zinc-700" />

          {/* Stats */}
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              {totalReactions.toLocaleString("es-AR")} reacciones totales
              {" "}
              <span className="text-zinc-600">&bull;</span>
              {" "}
              {totalUsers.toLocaleString("es-AR")} personas participaron
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-1">
            <p className="text-[10px] text-zinc-600 font-mono tracking-widest">
              matchfeel.com
            </p>
          </div>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full max-w-[360px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Compartir
      </button>
    </div>
  );
}
