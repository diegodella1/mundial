"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import UserDropdown from "./UserDropdown";

export default function NavBar() {
  const locale = useLocale();
  const tNav = useTranslations("nav");

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/40 shadow-lg shadow-black/10"
      style={{ paddingTop: "max(env(safe-area-inset-top), 10px)" }}
    >
      {/* Left: Brand */}
      <Link
        href={`/${locale}`}
        className="text-lg font-bold tracking-tight text-zinc-50 drop-shadow-[0_0_12px_rgba(255,255,255,0.08)] hover:text-white transition-colors"
      >
        Matchfeel
      </Link>

      {/* Right: nav items */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/matches`}
          className="hidden sm:inline text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {tNav("matches")}
        </Link>
        <LanguageSwitcher />
        <UserDropdown />
      </div>
    </nav>
  );
}
