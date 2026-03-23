import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Matchfeel Embed",
  description: "Matchfeel — Reacciones en tiempo real del Mundial 2026",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-950 text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
