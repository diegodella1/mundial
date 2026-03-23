"use client";

import { useTranslations } from "next-intl";

const steps = [
  {
    num: "1",
    titleKey: "howStep1Title" as const,
    descKey: "howStep1Desc" as const,
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    num: "2",
    titleKey: "howStep2Title" as const,
    descKey: "howStep2Desc" as const,
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
  },
  {
    num: "3",
    titleKey: "howStep3Title" as const,
    descKey: "howStep3Desc" as const,
    icon: (
      <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
];

const reactions = [
  { emoji: "\u26BD", label: "GOL" },
  { emoji: "\uD83D\uDD25", label: "GOLAZO" },
  { emoji: "\uD83D\uDE31", label: "ATAJADA" },
  { emoji: "\uD83E\uDD2C", label: "ROBO" },
  { emoji: "\uD83D\uDFE5", label: "EXPULSI\u00D3N" },
  { emoji: "\uD83E\uDD26", label: "LA ERR\u00D3" },
  { emoji: "\uD83D\uDE24", label: "PENAL" },
  { emoji: "\uD83C\uDF89", label: "CLASIFIC\u00D3" },
];

export default function HowItWorks() {
  const t = useTranslations("home");

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-16">
          {t("howTitle")}
        </h2>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              {/* Number badge */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-5 shadow-lg shadow-orange-500/20">
                <span className="text-xl font-black text-white">{step.num}</span>
              </div>

              {/* Icon */}
              <div className="mb-4">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-zinc-900 mb-2">
                {t(step.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-base text-zinc-600 leading-relaxed max-w-[280px]">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Reactions grid */}
        <div className="mt-16">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            {t("howReactionsLabel")}
          </p>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            {reactions.map(({ emoji, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-2 hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
