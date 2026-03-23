"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

// June 11, 2026 5:00 PM UTC (1:00 PM ET) — first match
const FIRST_MATCH = new Date("2026-06-11T17:00:00Z").getTime();

function useCountdown() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, FIRST_MATCH - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isLive: diff === 0 };
}

export default function HeroSection() {
  const t = useTranslations("home");
  const { days, hours, minutes, seconds } = useCountdown();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/api/auth/callback",
      },
    });
  }

  async function handleXSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: window.location.origin + "/api/auth/callback",
      },
    });
  }

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[100svh] px-6 pt-20 pb-32 text-center overflow-hidden">
      {/* Ambient glow behind hero */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-orange-500/10 via-pink-500/8 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Pulsing dots decoration */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-orange-400/40 animate-pulse-dot" />
      <div className="absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-pink-400/40 animate-pulse-dot-delayed" />
      <div className="absolute bottom-[35%] left-[25%] w-1.5 h-1.5 rounded-full bg-orange-300/30 animate-pulse-dot-slow" />

      {/* Headline */}
      <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-[800px] mx-auto">
          <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-300 bg-clip-text text-transparent animate-gradient-shimmer bg-[length:200%_auto]">
            {t("headline")}
          </span>
        </h1>
      </div>

      {/* Subtext */}
      <div className={`transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <p className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-[560px] mx-auto leading-relaxed">
          {t("subtext")}
        </p>
      </div>

      {/* Countdown */}
      <div className={`transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="mt-8 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {t("countdownPrefix")}
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <CountdownUnit value={days} label={t("countdownDays", { days })} />
            <span className="text-zinc-600 font-light text-xl -mt-3">:</span>
            <CountdownUnit value={hours} label={t("countdownHours", { hours })} />
            <span className="text-zinc-600 font-light text-xl -mt-3">:</span>
            <CountdownUnit value={minutes} label={t("countdownMinutes", { minutes })} />
            <span className="text-zinc-600 font-light text-xl -mt-3">:</span>
            <CountdownUnit value={seconds} label={t("countdownSeconds", { seconds })} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={`transition-all duration-700 delay-[450ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <a
          href="#upcoming"
          className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] min-h-[56px] focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {t("ctaStart")}
        </a>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={handleGoogleSignIn}
            className="text-sm text-zinc-400 hover:text-orange-400 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-orange-400/50"
          >
            {t("ctaGoogleSecondary")}
          </button>
          <span className="text-zinc-600">|</span>
          <button
            onClick={handleXSignIn}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-400 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-orange-400/50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {t("ctaXSecondary")}
          </button>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          {t("ctaSubtext")}
        </p>
      </div>

      {/* Scroll hint */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-[600ms] ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="flex flex-col items-center gap-1 animate-bounce-gentle">
          <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const unit = label.replace(String(value), "").trim();

  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-zinc-100">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">
        {unit}
      </span>
    </div>
  );
}
