"use client";

import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function FinalCTA() {
  const t = useTranslations("home");
  const supabase = createClient();

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/api/auth/callback",
      },
    });
  }

  return (
    <section className="relative bg-zinc-950 py-20 px-6 overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[80px] bg-gradient-to-b from-orange-500/10 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-8">
          {t("finalCtaTitle")}
        </h2>

        {/* CTA */}
        <a
          href="#upcoming"
          className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] min-h-[56px]"
        >
          {t("ctaStart")}
        </a>

        {/* Secondary */}
        <div className="mt-4">
          <button
            onClick={handleSignIn}
            className="text-sm text-zinc-400 hover:text-orange-400 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-orange-400/50"
          >
            {t("finalCtaSecondary")}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-800/50">
          <p className="text-sm text-zinc-500">
            {t("footerMadeWith")}
          </p>
        </div>
      </div>
    </section>
  );
}
