"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

// June 11, 2026 5:00 PM UTC (1:00 PM ET) — first match
const FIRST_MATCH = new Date("2026-06-11T17:00:00Z").getTime();

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

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

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
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
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-[720px] mx-auto">
          <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-300 bg-clip-text text-transparent animate-gradient-shimmer bg-[length:200%_auto]">
            {t("headline")}
          </span>
        </h1>
      </div>

      {/* Subtext */}
      <div className={`transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-[480px] mx-auto leading-relaxed">
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
        <button
          onClick={handleSignIn}
          className="mt-10 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] min-h-[56px] focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <GoogleIcon />
          {t("ctaGoogle")}
        </button>
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
  // Extract just the number portion for the big display
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
