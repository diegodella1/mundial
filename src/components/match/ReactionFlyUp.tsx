"use client";

import { useEffect } from "react";

export default function ReactionFlyUp({
  emoji,
  onComplete,
}: {
  emoji: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 animate-fly-up text-3xl z-10">
      {emoji}
    </span>
  );
}
