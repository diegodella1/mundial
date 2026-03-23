"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Partidos", href: "/admin/matches" },
  { label: "Reacciones", href: "/admin/reactions" },
  { label: "Moderación", href: "/admin/moderation" },
  { label: "Sponsors", href: "/admin/sponsors" },
  { label: "Media Kit", href: "/admin/media-kit" },
];

export default function AdminShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    const full = `/${locale}${href}`;
    if (href === "/admin") return pathname === full;
    return pathname.startsWith(full);
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 md:block">
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Matchfeel
          </h2>
          <p className="text-xs text-zinc-500">Admin</p>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:hidden">
          <div>
            <span className="text-sm font-bold text-white">Matchfeel</span>
            <span className="ml-2 text-xs text-zinc-500">Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </header>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-b border-zinc-800 bg-zinc-900 px-2 py-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
