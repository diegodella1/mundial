"use client";
import { useRef, useEffect, useCallback } from "react";
import { MAP_PATHS } from "./map-data";

// Color scales for intensity layer (low to high activity)
const HEAT_COLORS = [
  "#1e293b", // 0 - inactive (slate-800 — visible!)
  "#1e3a5f", // very low
  "#0f4c75", // low
  "#1a7a4c", // medium-low
  "#22c55e", // medium — green
  "#eab308", // medium-high — yellow
  "#f97316", // high — orange
  "#ef4444", // very high — red
];

// Color mapping per reaction emoji for sentiment layer
const REACTION_COLORS: Record<string, string> = {
  "\u26BD": "#22c55e", // green - goal
  "\uD83D\uDD25": "#f97316", // orange - banger
  "\uD83D\uDE31": "#3b82f6", // blue - save
  "\uD83E\uDD2C": "#ef4444", // red - robbery
  "\uD83D\uDFE5": "#dc2626", // dark red - red card
  "\uD83E\uDD26": "#a855f7", // purple - missed
  "\uD83D\uDE24": "#eab308", // yellow - penalty
  "\uD83C\uDF89": "#06b6d4", // cyan - qualified
};

interface MapState {
  countries: Record<string, { count: number; top: string }>;
  totalActive: number;
}

interface WorldMapProps {
  mapState?: MapState;
  layer?: "intensity" | "sentiment";
  demo?: boolean;
}

// Countries that participate in the World Cup 2026 — used for demo
const DEMO_COUNTRIES = [
  "MX", "ZA", "KR", "CA", "CH", "QA", "BR", "MA", "US", "PY",
  "AU", "DE", "EC", "NL", "JP", "TN", "ES", "SA", "UY", "BE",
  "EG", "IR", "NZ", "FR", "SN", "NO", "AR", "DZ", "AT", "JO",
  "GB", "HR", "GH", "PA", "PT", "UZ", "CO", "HT",
];

const DEMO_EMOJIS = ["⚽", "🔥", "😱", "🤬", "🎉", "😤", "🤦", "🟥"];

export default function WorldMap({ mapState, layer = "intensity", demo = false }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const demoInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update colors via direct DOM manipulation — no re-render
  const updateColors = useCallback((state: MapState, currentLayer: string) => {
    const svg = svgRef.current;
    if (!svg) return;

    const maxCount = Math.max(
      ...Object.values(state.countries).map((c) => c.count),
      1
    );

    // Reset all countries to base
    svg.querySelectorAll("path[data-country]").forEach((path) => {
      (path as SVGPathElement).style.fill = "#1e293b";
    });

    // Update active countries
    for (const [code, data] of Object.entries(state.countries)) {
      const path = svg.querySelector(
        `path[data-country="${code}"]`
      ) as SVGPathElement;
      if (!path) continue;

      if (currentLayer === "intensity") {
        const intensity = Math.min(
          Math.floor((data.count / maxCount) * (HEAT_COLORS.length - 1)),
          HEAT_COLORS.length - 1
        );
        path.style.fill = HEAT_COLORS[intensity];
      } else {
        path.style.fill = REACTION_COLORS[data.top] || "#1e293b";
      }
    }
  }, []);

  // Demo mode: simulate random reactions lighting up the map
  useEffect(() => {
    if (!demo) return;

    const svg = svgRef.current;
    if (!svg) return;

    // Start with a few countries lit up
    const activeCountries = new Map<string, { count: number; top: string }>();

    function tick() {
      // Randomly add/update 2-4 countries per tick
      const numChanges = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numChanges; i++) {
        const country = DEMO_COUNTRIES[Math.floor(Math.random() * DEMO_COUNTRIES.length)];
        const emoji = DEMO_EMOJIS[Math.floor(Math.random() * DEMO_EMOJIS.length)];
        const existing = activeCountries.get(country);
        activeCountries.set(country, {
          count: (existing?.count || 0) + Math.floor(Math.random() * 20) + 5,
          top: emoji,
        });
      }

      // Randomly cool down some countries
      for (const [code, data] of activeCountries) {
        if (Math.random() < 0.15) {
          const newCount = data.count - Math.floor(Math.random() * 15);
          if (newCount <= 0) {
            activeCountries.delete(code);
          } else {
            activeCountries.set(code, { ...data, count: newCount });
          }
        }
      }

      const state: MapState = {
        countries: Object.fromEntries(activeCountries),
        totalActive: Array.from(activeCountries.values()).reduce((s, c) => s + c.count, 0),
      };
      updateColors(state, "intensity");
    }

    // Initial burst: light up several countries immediately
    for (let i = 0; i < 8; i++) {
      const country = DEMO_COUNTRIES[i];
      activeCountries.set(country, {
        count: Math.floor(Math.random() * 80) + 20,
        top: DEMO_EMOJIS[Math.floor(Math.random() * DEMO_EMOJIS.length)],
      });
    }
    tick();

    demoInterval.current = setInterval(tick, 2000);
    return () => {
      if (demoInterval.current) clearInterval(demoInterval.current);
    };
  }, [demo, updateColors]);

  // Real data updates
  useEffect(() => {
    if (!demo && mapState) {
      updateColors(mapState, layer);
    }
  }, [mapState, layer, updateColors, demo]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 500"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {MAP_PATHS.map((country) => (
        <path
          key={country.id}
          data-country={country.id}
          d={country.d}
          className="map-country"
          style={{
            fill: "#1e293b",
            stroke: "#334155",
            strokeWidth: 0.4,
            transition: "fill 0.8s ease",
          }}
        />
      ))}
    </svg>
  );
}
