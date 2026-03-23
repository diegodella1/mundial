import "../globals.css";

export const metadata = {
  title: "Matchfeel — Pitch Deck",
  description: "El mapa de emociones del Mundial 2026. Pitch para marcas e inversores.",
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
