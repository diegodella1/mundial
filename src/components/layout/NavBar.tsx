"use client";

import AuthButton from "@/components/auth/AuthButton";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/40 shadow-lg shadow-black/10"
      style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
    >
      <span className="text-lg font-bold tracking-tight text-zinc-50 drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]">
        Matchfeel
      </span>
      <div className="flex items-center min-h-[44px]">
        <AuthButton />
      </div>
    </nav>
  );
}
