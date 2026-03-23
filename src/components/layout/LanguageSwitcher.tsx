"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return;
    // Replace the locale prefix in the pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center rounded-full bg-zinc-800/60 border border-zinc-700/40 p-0.5 text-xs">
      <button
        onClick={() => switchLocale("es")}
        className={`rounded-full px-2 py-0.5 font-medium transition-all ${
          locale === "es"
            ? "bg-zinc-600 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`rounded-full px-2 py-0.5 font-medium transition-all ${
          locale === "en"
            ? "bg-zinc-600 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        EN
      </button>
    </div>
  );
}
