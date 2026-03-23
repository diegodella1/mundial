"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useLocale } from "next-intl";

interface ReactionDetail {
  reactionId: string;
  emoji: string;
  labelEs: string;
  labelEn: string;
}

interface MatchContext {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  matchMinute: number | null;
}

interface TweetPromptProps {
  matchContext: MatchContext;
  lastReaction: ReactionDetail | null;
  reactionCount: number;
}

const TWEET_TEMPLATES_ES: Record<string, string> = {
  gol: "⚽ GOOOL en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  golazo: "🔥 GOLAZO en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  atajada: "😱 Atajadón en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  robo: "🤬 ROBO en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  roja: "🟥 Roja en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  erro: "🤦 La erró en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  penal: "😤 PENAL en {home} vs {away}!{minute} {url} #Matchfeel #Mundial2026",
  clasifico: "🎉 CLASIFICÓ! {home} vs {away} {url} #Matchfeel #Mundial2026",
};

const TWEET_TEMPLATES_EN: Record<string, string> = {
  gol: "⚽ GOOOL in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  golazo: "🔥 GOLAZO in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  atajada: "😱 AMAZING SAVE in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  robo: "🤬 ROBBERY in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  roja: "🟥 RED CARD in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  erro: "🤦 Missed it in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  penal: "😤 PENALTY in {home} vs {away}!{minute} {url} #Matchfeel #WorldCup2026",
  clasifico: "🎉 QUALIFIED! {home} vs {away} {url} #Matchfeel #WorldCup2026",
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function buildTweetText(
  reactionId: string,
  matchContext: MatchContext,
  locale: string
): string {
  const templates = locale === "es" ? TWEET_TEMPLATES_ES : TWEET_TEMPLATES_EN;

  // Map reaction IDs to template keys
  const keyMap: Record<string, string> = {
    gol: "gol",
    golazo: "golazo",
    atajada: "atajada",
    robo: "robo",
    roja: "roja",
    erro: "erro",
    penal: "penal",
    clasifico: "clasifico",
  };

  const templateKey = keyMap[reactionId] || "gol";
  const template = templates[templateKey] || templates.gol;

  const minuteStr =
    matchContext.matchMinute != null ? ` ${matchContext.matchMinute}'` : "";
  const matchUrl = `https://mundial.diegodella.ar/${locale}/match/${matchContext.matchId}`;
  const hashtag = `#${matchContext.homeCode}vs${matchContext.awayCode}`;

  return template
    .replace("{home}", matchContext.homeTeam)
    .replace("{away}", matchContext.awayTeam)
    .replace("{minute}", minuteStr)
    .replace("{url}", matchUrl)
    .replace("#Matchfeel", `${hashtag} #Matchfeel`);
}

export default function TweetPrompt({
  matchContext,
  lastReaction,
  reactionCount,
}: TweetPromptProps) {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountRef = useRef(reactionCount);

  // Check if tweet sharing is enabled (default: true)
  const isEnabled = useCallback(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("matchfeel_tweet_enabled");
    return stored !== "false";
  }, []);

  useEffect(() => {
    // Only trigger on reaction count changes (not initial mount)
    if (reactionCount === 0 || reactionCount === prevCountRef.current) return;
    prevCountRef.current = reactionCount;

    // Only show every 3rd reaction
    // Show on every reaction

    if (!isEnabled() || !lastReaction) return;

    const text = buildTweetText(lastReaction.reactionId, matchContext, locale);
    setTweetText(text);
    setVisible(true);

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Auto-dismiss after 4 seconds
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reactionCount, lastReaction, matchContext, locale, isEnabled]);

  const handleShare = useCallback(() => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer,width=550,height=420");
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [tweetText]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!visible) return null;

  const previewText =
    tweetText.length > 90 ? tweetText.slice(0, 90) + "..." : tweetText;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-slide-up">
      <div className="relative flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-700/50 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* X button */}
        <button
          onClick={handleShare}
          className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-white active:scale-[0.97] min-h-[44px]"
        >
          <XIcon className="w-4 h-4" />
          <span className="hidden sm:inline">
            {locale === "es" ? "Compartir en X" : "Share on X"}
          </span>
          <span className="sm:hidden">X</span>
        </button>

        {/* Preview */}
        <p className="flex-1 text-xs text-zinc-400 leading-snug line-clamp-2 pr-4">
          {previewText}
        </p>
      </div>
    </div>
  );
}
