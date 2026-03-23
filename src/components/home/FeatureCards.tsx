"use client";

import { useTranslations } from "next-intl";

const features = [
  { icon: "\u{1F5FA}\uFE0F", key: "featureLiveMap", descKey: "featureLiveMapDesc" },
  { icon: "\u26BD", key: "featureReactions", descKey: "featureReactionsDesc" },
  { icon: "\u{1F9FE}", key: "featureReceipt", descKey: "featureReceiptDesc" },
] as const;

export default function FeatureCards() {
  const t = useTranslations("home");

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* Section headline */}
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-zinc-100 mb-12 max-w-[600px] mx-auto leading-snug">
        {t("statsHeadline")}
      </h2>

      {/* Cards — horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0 max-w-3xl mx-auto scrollbar-hide">
        {features.map(({ icon, key, descKey }) => (
          <div
            key={key}
            className="flex-shrink-0 w-[280px] sm:w-auto snap-center group"
          >
            <div className="relative h-full rounded-2xl border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-800/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.06)]">
              {/* Icon */}
              <div className="text-3xl mb-4">{icon}</div>

              {/* Title */}
              <h3 className="text-lg font-bold text-zinc-100 mb-2">
                {t(key)}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t(descKey)}
              </p>

              {/* Subtle gradient accent on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 to-pink-500/0 group-hover:from-orange-500/[0.03] group-hover:to-pink-500/[0.03] transition-all duration-300 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
