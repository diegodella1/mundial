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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function buildTweetText(
  reaction: ReactionDetail,
  matchContext: MatchContext,
  locale: string
): string {
  const label = locale === "es" ? reaction.labelEs : reaction.labelEn;
  const minuteStr = matchContext.matchMinute != null ? ` ${matchContext.matchMinute}'` : "";
  const matchUrl = `https://mundial.diegodella.ar/${locale}/match/${matchContext.matchId}`;
  const hashtag = `#${matchContext.homeCode}vs${matchContext.awayCode}`;

  return `${reaction.emoji} ${label} en ${matchContext.homeTeam} vs ${matchContext.awayTeam}!${minuteStr} ${matchUrl} ${hashtag} #Matchfeel #Mundial2026`;
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

  const isEnabled = useCallback(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("matchfeel_tweet_enabled") !== "false";
  }, []);

  useEffect(() => {
    if (reactionCount === 0 || reactionCount === prevCountRef.current) return;
    prevCountRef.current = reactionCount;

    if (!isEnabled() || !lastReaction) return;

    const text = buildTweetText(lastReaction, matchContext, locale);
    setTweetText(text);
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reactionCount, lastReaction, matchContext, locale, isEnabled]);

  const handleShare = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      "_blank",
      "noopener,noreferrer,width=550,height=420"
    );
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [tweetText]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!visible) return null;

  const previewText = tweetText.length > 90 ? tweetText.slice(0, 90) + "..." : tweetText;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg animate-slide-up md:bottom-4">
      <div className="relative flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-700/50 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

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

        <p className="flex-1 text-xs text-zinc-400 leading-snug line-clamp-2 pr-4">
          {previewText}
        </p>
      </div>
    </div>
  );
}
