"use client";

import { useTranslations } from "next-intl";

const features = [
  { icon: "\uD83D\uDDFA\uFE0F", titleKey: "featureLiveMap" as const, descKey: "featureLiveMapDesc" as const },
  { icon: "\u26BD", titleKey: "featureReactions" as const, descKey: "featureReactionsDesc" as const },
  { icon: "\uD83E\uDDFE", titleKey: "featureReceipt" as const, descKey: "featureReceiptDesc" as const },
  { icon: "\uD83D\uDCAC", titleKey: "featureChat" as const, descKey: "featureChatDesc" as const },
];

export default function FeatureCards() {
  const t = useTranslations("home");

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section headline */}
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-zinc-900 mb-14">
          {t("featuresTitle")}
        </h2>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map(({ icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 hover:border-orange-300/60 hover:shadow-md transition-all duration-200"
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{icon}</div>

              {/* Title */}
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                {t(titleKey)}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-600 leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
