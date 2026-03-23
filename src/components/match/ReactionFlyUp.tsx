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
    <span className="pointer-events-none absolute inset-x-0 top-0 flex justify-center -translate-y-2 animate-fly-up text-4xl z-10">
      {emoji}
    </span>
  );
}
