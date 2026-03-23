"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * AuthButton — used on landing page CTAs (not in NavBar).
 * Shows Google sign-in button when not logged in, nothing when logged in
 * (the NavBar handles logged-in state via UserDropdown).
 */
export default function AuthButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const t = useTranslations("common");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, [supabase]);

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

  if (loading || user) {
    return null;
  }

  if (variant === "secondary") {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleGoogleSignIn}
          className="text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
        >
          {t("login")}
        </button>
        <span className="text-zinc-600">|</span>
        <button
          onClick={handleXSignIn}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
        >
          <XIcon />
          {t("loginX")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-100 active:scale-[0.97] min-h-[44px] focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <GoogleIcon />
        {t("login")}
      </button>
      <button
        onClick={handleXSignIn}
        className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition-all hover:bg-zinc-800 active:scale-[0.97] min-h-[44px] focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        <XIcon />
        {t("loginX")}
      </button>
    </div>
  );
}
