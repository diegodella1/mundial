"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  if (isNaN(ts)) return false;
  return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const t = useTranslations("install");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Already installed or recently dismissed
    if (isStandalone() || isDismissed()) return;

    const isIOSDevice = isIOSSafari();
    setIsIOS(isIOSDevice);

    // For chromium browsers
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show after 10 seconds
    const timer = setTimeout(() => {
      // For iOS, show if it's Safari on iOS
      // For others, only show if we captured the prompt event
      if (isIOSDevice) {
        setShowBanner(true);
      }
    }, 10000);

    // Listen for app installed
    const installedHandler = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(timer);
    };
  }, []);

  // Show banner when deferred prompt is captured (after the 10s delay)
  useEffect(() => {
    if (!deferredPrompt) return;
    const timer = setTimeout(() => {
      if (!isDismissed() && !isStandalone()) {
        setShowBanner(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [deferredPrompt]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissing(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setTimeout(() => setShowBanner(false), 300);
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 ${
        dismissing ? "animate-slide-down" : "animate-slide-up"
      }`}
    >
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800/40 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-xl">
        {isIOS ? (
          /* iOS Safari instructions */
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-2xl">📱</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{t("title")}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {t.rich("ios", {
                  icon: () => (
                    <span className="inline-flex items-center">
                      <svg
                        className="mx-0.5 inline h-4 w-4 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </span>
                  ),
                })}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-2 shrink-0 rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              aria-label={t("dismiss")}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Chrome / Edge / Android */
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{t("title")}</p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              {t("button")}
            </button>
            <button
              onClick={handleDismiss}
              className="ml-1 shrink-0 rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              aria-label={t("dismiss")}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
