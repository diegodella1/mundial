"use client";

import AuthButton from "@/components/auth/AuthButton";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-800/50">
      <span className="text-lg font-bold tracking-tight text-zinc-100">
        Matchfeel
      </span>
      <AuthButton />
    </nav>
  );
}
