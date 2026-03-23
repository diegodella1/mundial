import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function MediaKitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const { data: matches } = await supabaseAdmin
    .from("matches")
    .select("id, home_team, away_team, home_code, away_code, home_score, away_score, kickoff_at")
    .eq("status", "finished")
    .order("kickoff_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Media Kit</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Descarga el PDF con datos de engagement para cada partido finalizado.
      </p>

      {(!matches || matches.length === 0) && (
        <p className="text-sm text-zinc-500">No hay partidos finalizados.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(matches ?? []).map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                {new Date(m.kickoff_at).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{m.home_code}</p>
                <p className="text-xs text-zinc-500">{m.home_team}</p>
              </div>
              <p className="text-xl font-bold text-white">
                {m.home_score} - {m.away_score}
              </p>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{m.away_code}</p>
                <p className="text-xs text-zinc-500">{m.away_team}</p>
              </div>
            </div>

            <a
              href={`/api/admin/media-kit/${m.id}`}
              className="block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Descargar PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
