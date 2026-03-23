"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Match = {
  id: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  kickoff_at: string;
  group_name: string | null;
  round: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
};

type MatchForm = {
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  kickoff_at: string;
  group_name: string;
  round: string;
};

const ROUNDS = [
  { value: "group", label: "Fase de grupos" },
  { value: "r16", label: "Octavos de final" },
  { value: "quarter", label: "Cuartos de final" },
  { value: "semi", label: "Semifinal" },
  { value: "third", label: "Tercer puesto" },
  { value: "final", label: "Final" },
];

const EMPTY_FORM: MatchForm = {
  home_team: "",
  away_team: "",
  home_code: "",
  away_code: "",
  kickoff_at: "",
  group_name: "",
  round: "group",
};

export default function MatchesPage() {
  const supabase = createClient();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MatchForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchMatches() {
    setLoading(true);
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setMatches(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(match: Match) {
    setForm({
      home_team: match.home_team,
      away_team: match.away_team,
      home_code: match.home_code,
      away_code: match.away_code,
      kickoff_at: match.kickoff_at
        ? match.kickoff_at.slice(0, 16)
        : "",
      group_name: match.group_name ?? "",
      round: match.round,
    });
    setEditingId(match.id);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      home_team: form.home_team.trim(),
      away_team: form.away_team.trim(),
      home_code: form.home_code.trim().toUpperCase(),
      away_code: form.away_code.trim().toUpperCase(),
      kickoff_at: form.kickoff_at,
      group_name: form.group_name.trim() || null,
      round: form.round,
    };

    if (
      !payload.home_team ||
      !payload.away_team ||
      !payload.home_code ||
      !payload.away_code ||
      !payload.kickoff_at
    ) {
      setError("Completar todos los campos obligatorios.");
      setSaving(false);
      return;
    }

    if (payload.home_code.length !== 3 || payload.away_code.length !== 3) {
      setError("Los códigos de equipo deben tener 3 caracteres.");
      setSaving(false);
      return;
    }

    let result;
    if (editingId) {
      result = await supabase
        .from("matches")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("matches").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      closeForm();
      await fetchMatches();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este partido?")) return;

    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      await fetchMatches();
    }
  }

  function formatDate(iso: string) {
    if (!iso) return "—";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Partidos</h1>
        <button
          onClick={openNew}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Nuevo partido
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingId ? "Editar partido" : "Nuevo partido"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Equipo local *
              </label>
              <input
                type="text"
                value={form.home_team}
                onChange={(e) =>
                  setForm({ ...form, home_team: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Argentina"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Equipo visitante *
              </label>
              <input
                type="text"
                value={form.away_team}
                onChange={(e) =>
                  setForm({ ...form, away_team: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Brasil"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Código local (3 chars) *
              </label>
              <input
                type="text"
                maxLength={3}
                value={form.home_code}
                onChange={(e) =>
                  setForm({ ...form, home_code: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm uppercase text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="ARG"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Código visitante (3 chars) *
              </label>
              <input
                type="text"
                maxLength={3}
                value={form.away_code}
                onChange={(e) =>
                  setForm({ ...form, away_code: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm uppercase text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="BRA"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Kickoff *
              </label>
              <input
                type="datetime-local"
                value={form.kickoff_at}
                onChange={(e) =>
                  setForm({ ...form, kickoff_at: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Grupo
              </label>
              <input
                type="text"
                value={form.group_name}
                onChange={(e) =>
                  setForm({ ...form, group_name: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="A"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-zinc-400">
                Ronda *
              </label>
              <select
                value={form.round}
                onChange={(e) => setForm({ ...form, round: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {ROUNDS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear partido"}
            </button>
            <button
              onClick={closeForm}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-zinc-500">Cargando partidos...</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay partidos cargados.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400">
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium">Visitante</th>
                <th className="px-4 py-3 font-medium">Kickoff</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, i) => (
                <tr
                  key={match.id}
                  className={`border-b border-zinc-800 ${
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"
                  }`}
                >
                  <td className="px-4 py-3 text-white">
                    <span className="mr-1 text-zinc-500">{match.home_code}</span>
                    {match.home_team}
                  </td>
                  <td className="px-4 py-3 text-white">
                    <span className="mr-1 text-zinc-500">{match.away_code}</span>
                    {match.away_team}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {formatDate(match.kickoff_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        match.status === "live"
                          ? "bg-emerald-900/50 text-emerald-400"
                          : match.status === "finished"
                            ? "bg-zinc-700 text-zinc-300"
                            : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {match.home_score !== null && match.away_score !== null
                      ? `${match.home_score} - ${match.away_score}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(match)}
                        className="text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(match.id)}
                        className="text-sm text-red-400 transition-colors hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
