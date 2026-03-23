"use client";

import { useState } from "react";

type FinishedMatch = {
  id: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  home_score: number | null;
  away_score: number | null;
  kickoff_at: string;
};

export default function DashboardClient({
  totalReactions,
  liveMatches,
  totalUsers,
  recentReactions,
  finishedMatches,
}: {
  totalReactions: number;
  liveMatches: number;
  totalUsers: number;
  recentReactions: number;
  finishedMatches: FinishedMatch[];
}) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  const stats = [
    { label: "Usuarios totales", value: totalUsers.toLocaleString("es-AR") },
    { label: "Reacciones totales", value: totalReactions.toLocaleString("es-AR") },
    { label: "Partidos en vivo", value: liveMatches.toLocaleString("es-AR") },
    { label: "Reacciones (24h)", value: recentReactions.toLocaleString("es-AR") },
  ];

  async function handleGenerateReceipts(matchId: string) {
    setGenerating(matchId);
    setResults((prev) => ({ ...prev, [matchId]: "" }));

    try {
      const res = await fetch("/api/admin/generate-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResults((prev) => ({
          ...prev,
          [matchId]: `Error: ${data.error}`,
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          [matchId]: `Generados: ${data.generated}, Ya existentes: ${data.alreadyExisted ?? 0}, Errores: ${data.errors ?? 0}`,
        }));
      }
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [matchId]: `Error de red: ${err instanceof Error ? err.message : "desconocido"}`,
      }));
    } finally {
      setGenerating(null);
    }
  }

  function formatDate(iso: string) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-zinc-800 p-6"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Generate Receipts Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white">Generar Receipts</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Partidos finalizados. Genera receipts para todos los usuarios que reaccionaron.
        </p>

        {finishedMatches.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No hay partidos finalizados.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {finishedMatches.map((match) => (
              <div
                key={match.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-700 bg-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">
                    {match.home_team} {match.home_score} - {match.away_score} {match.away_team}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDate(match.kickoff_at)}</p>
                  {results[match.id] && (
                    <p
                      className={`mt-1 text-xs ${
                        results[match.id].startsWith("Error")
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {results[match.id]}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateReceipts(match.id)}
                    disabled={generating === match.id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {generating === match.id ? "Generando..." : "Generar Receipts"}
                  </button>
                  <a
                    href={`/api/admin/export/${match.id}`}
                    className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Exportar CSV
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
