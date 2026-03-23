"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import WorldMap from "@/components/map/WorldMap";
import { createClient } from "@/lib/supabase/client";
import Flag from "@/components/ui/Flag";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  home_score: number;
  away_score: number;
  status: string;
  match_minute: number | null;
}

interface MapState {
  countries: Record<string, { count: number; top: string }>;
  totalActive: number;
}

const LABELS = {
  es: {
    people: "personas reaccionando ahora",
    poweredBy: "Powered by",
    vs: "vs",
    live: "EN VIVO",
    final: "FINAL",
    minute: "min",
  },
  en: {
    people: "people reacting now",
    poweredBy: "Powered by",
    vs: "vs",
    live: "LIVE",
    final: "FINAL",
    minute: "min",
  },
} as const;

export default function EmbedClient() {
  const searchParams = useSearchParams();

  const matchId = searchParams.get("match_id");
  const lang = (searchParams.get("lang") as "es" | "en") || "es";
  const view = (searchParams.get("view") as "map" | "reactions" | "both") || "both";
  const theme = (searchParams.get("theme") as "light" | "dark") || "dark";

  const labels = LABELS[lang] || LABELS.es;

  const [mapState, setMapState] = useState<MapState>({
    countries: {},
    totalActive: 0,
  });
  const [match, setMatch] = useState<Match | null>(null);

  // Apply theme
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.remove("bg-zinc-950", "text-white");
      document.body.classList.add("bg-gray-50", "text-gray-900");
    } else {
      document.body.classList.remove("bg-gray-50", "text-gray-900");
      document.body.classList.add("bg-zinc-950", "text-white");
    }
  }, [theme]);

  // Fetch match data
  useEffect(() => {
    if (!matchId) return;

    const supabase = createClient();

    async function fetchMatch() {
      const { data } = await supabase
        .from("matches")
        .select("id, home_team, away_team, home_code, away_code, home_score, away_score, status, match_minute")
        .eq("id", matchId)
        .single();

      if (data) setMatch(data as Match);
    }

    fetchMatch();

    // Subscribe to match updates
    const channel = supabase
      .channel(`embed_match_${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          setMatch(payload.new as Match);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Subscribe to map state
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("map_state")
      .on("broadcast", { event: "update" }, ({ payload }) => {
        setMapState(payload as MapState);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isLight = theme === "light";
  const isLive = match?.status === "live" || match?.status === "halftime";
  const isFinished = match?.status === "finished";
  const hasScore = isLive || isFinished;

  const showMap = view === "map" || view === "both";
  const showReactions = view === "reactions" || view === "both";

  return (
    <div className="flex flex-col h-screen p-3 gap-3">
      {/* Match score header */}
      {match && (
        <div className="text-center shrink-0">
          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-xs mb-1.5">
            {isLive && (
              <span className="flex items-center gap-1.5 font-bold text-red-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                {match.match_minute != null
                  ? `${match.match_minute} ${labels.minute}`
                  : labels.live}
              </span>
            )}
            {isFinished && (
              <span className={`font-bold uppercase ${isLight ? "text-gray-500" : "text-zinc-400"}`}>
                {labels.final}
              </span>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center justify-center gap-3">
            <Flag code={match.home_code} size="md" />
            <span className={`text-lg font-bold tracking-wide ${isLight ? "text-gray-800" : "text-zinc-100"}`}>
              {match.home_code}
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums">
              {hasScore ? (
                <>
                  <span className={isLight ? "text-gray-800" : "text-zinc-100"}>{match.home_score}</span>
                  <span className={isLight ? "text-gray-400" : "text-zinc-600"}> - </span>
                  <span className={isLight ? "text-gray-800" : "text-zinc-100"}>{match.away_score}</span>
                </>
              ) : (
                <span className={isLight ? "text-gray-400" : "text-zinc-600"}>{labels.vs}</span>
              )}
            </span>
            <span className={`text-lg font-bold tracking-wide ${isLight ? "text-gray-800" : "text-zinc-100"}`}>
              {match.away_code}
            </span>
            <Flag code={match.away_code} size="md" />
          </div>
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="flex-1 min-h-0 relative">
          <WorldMap mapState={mapState} layer="intensity" />
        </div>
      )}

      {/* Active counter */}
      {showReactions && (
        <div className="shrink-0">
          <div className={`text-center rounded-xl px-4 py-3 ${isLight ? "bg-white border border-gray-200" : "bg-zinc-900 border border-zinc-800/50"}`}>
            <p className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500`}>
              {mapState.totalActive.toLocaleString(lang === "es" ? "es-AR" : "en-US")}
            </p>
            <p className={`text-sm mt-0.5 ${isLight ? "text-gray-500" : "text-zinc-400"}`}>
              {labels.people}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center shrink-0 pt-1">
        <a
          href="https://mundial.diegodella.ar"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[11px] ${isLight ? "text-gray-400 hover:text-gray-600" : "text-zinc-500 hover:text-zinc-300"} transition-colors`}
        >
          {labels.poweredBy}{" "}
          <span className="font-semibold hover:underline">Matchfeel</span>
        </a>
      </div>
    </div>
  );
}
