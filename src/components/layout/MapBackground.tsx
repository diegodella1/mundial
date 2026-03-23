"use client";

import WorldMap from "@/components/map/WorldMap";
import { useRealtimeMap } from "@/hooks/useRealtimeMap";

interface MapBackgroundProps {
  demo?: boolean;
}

export default function MapBackground({ demo = false }: MapBackgroundProps) {
  const { mapState, layer } = useRealtimeMap();

  // Use demo mode when no real data is coming in (pre-tournament)
  const hasRealData = mapState.totalActive > 0;
  const useDemo = demo && !hasRealData;

  return (
    <div className="fixed inset-0 z-0">
      <WorldMap
        mapState={hasRealData ? mapState : undefined}
        layer={layer}
        demo={useDemo}
      />
      {/* Vignette overlay — lighter to show more map */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(9, 9, 11, 0.5) 100%)",
        }}
      />
    </div>
  );
}
