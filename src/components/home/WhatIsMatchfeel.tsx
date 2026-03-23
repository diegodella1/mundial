"use client";

import { useTranslations } from "next-intl";

const stats = [
  { value: "48", key: "statNations" as const },
  { value: "72", key: "statMatches" as const },
  { value: "1", key: "statMap" as const },
];

export default function WhatIsMatchfeel() {
  const t = useTranslations("home");

  return (
    <section className="bg-zinc-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-8">
          {t("whatTitle")}
        </h2>

        {/* Description */}
        <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed text-center max-w-3xl mx-auto">
          {t("whatDescription")}
        </p>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {stats.map(({ value, key }) => (
            <div key={key} className="flex flex-col items-center text-center">
              <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                {value}
              </span>
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mt-1">
                {t(key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
