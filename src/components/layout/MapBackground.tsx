"use client";

import WorldMap from "@/components/map/WorldMap";
import { useRealtimeMap } from "@/hooks/useRealtimeMap";

export default function MapBackground() {
  const { mapState, layer } = useRealtimeMap();

  return (
    <div className="fixed inset-0 z-0">
      <WorldMap mapState={mapState} layer={layer} />
      {/* Vignette overlay to darken edges and improve content readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(9, 9, 11, 0.6) 100%)",
        }}
      />
    </div>
  );
}
