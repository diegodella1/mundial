"use client";
import { useRef, useEffect, useCallback } from "react";
import { MAP_PATHS } from "./map-data";

// Color scales for intensity layer (low to high activity)
const HEAT_COLORS = [
  "#1a1a2e", // 0 - inactive (dark)
  "#16213e", // very low
  "#0f3460", // low
  "#1a5276", // medium-low
  "#1e8449", // medium
  "#f39c12", // medium-high
  "#e74c3c", // high
  "#c0392b", // very high
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
}

export default function WorldMap({ mapState, layer = "intensity" }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Update colors via direct DOM manipulation — no re-render
  const updateColors = useCallback((state: MapState, currentLayer: string) => {
    const svg = svgRef.current;
    if (!svg) return;

    const maxCount = Math.max(
      ...Object.values(state.countries).map((c) => c.count),
      1
    );

    // Reset all countries to inactive
    svg.querySelectorAll("path[data-country]").forEach((path) => {
      (path as SVGPathElement).style.fill = "#1a1a2e";
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
        path.style.fill = REACTION_COLORS[data.top] || "#1a1a2e";
      }
    }
  }, []);

  useEffect(() => {
    if (mapState) {
      updateColors(mapState, layer);
    }
  }, [mapState, layer, updateColors]);

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
            fill: "#1a1a2e",
            stroke: "#2a2a3e",
            strokeWidth: 0.5,
            transition: "fill 0.5s ease",
          }}
        />
      ))}
    </svg>
  );
}
