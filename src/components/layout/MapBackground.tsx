"use client";

import WorldMap from "@/components/map/WorldMap";

export default function MapBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <WorldMap />
    </div>
  );
}
