"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MapState {
  countries: Record<string, { count: number; top: string }>;
  totalActive: number;
}

export function useRealtimeMap() {
  const [mapState, setMapState] = useState<MapState>({
    countries: {},
    totalActive: 0,
  });
  const [layer, setLayer] = useState<"intensity" | "sentiment">("intensity");

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

  return { mapState, layer, setLayer };
}
