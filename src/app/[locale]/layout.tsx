import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import NavBar from "@/components/layout/NavBar";
import MapBackground from "@/components/layout/MapBackground";

export const metadata: Metadata = {
  title: "Matchfeel — Mundial 2026",
  description: "Sentí el mundo en tiempo real. Reacciones en vivo del Mundial 2026.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* World map fixed background */}
          <MapBackground />

          {/* Top navigation */}
          <NavBar />

          {/* Page content */}
          <main className="relative z-10">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
