"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReactionConfig = {
  id: string;
  emoji: string;
  label_es: string;
  label_en: string;
  is_active: boolean;
  match_id: string | null;
  sponsor_id: string | null;
  sort_order: number;
  created_at: string;
};

type Match = {
  id: string;
  home_team: string;
  away_team: string;
};

type Sponsor = {
  id: string;
  name: string;
};

type ReactionForm = {
  emoji: string;
  label_es: string;
  label_en: string;
  sort_order: number;
  match_id: string;
  sponsor_id: string;
};

const EMPTY_FORM: ReactionForm = {
  emoji: "",
  label_es: "",
  label_en: "",
  sort_order: 0,
  match_id: "",
  sponsor_id: "",
};

export default function ReactionsConfigPage() {
  const supabase = createClient();

  const [reactions, setReactions] = useState<ReactionConfig[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReactionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    const [reactionsRes, matchesRes, sponsorsRes] = await Promise.all([
      supabase
        .from("reactions_config")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("matches")
        .select("id, home_team, away_team")
        .order("kickoff_at", { ascending: false }),
      supabase.from("sponsors").select("id, name").order("name"),
    ]);

    if (reactionsRes.error) setError(reactionsRes.error.message);
    else setReactions(reactionsRes.data ?? []);

    setMatches(matchesRes.data ?? []);
    setSponsors(sponsorsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(r: ReactionConfig) {
    setForm({
      emoji: r.emoji,
      label_es: r.label_es,
      label_en: r.label_en,
      sort_order: r.sort_order,
      match_id: r.match_id ?? "",
      sponsor_id: r.sponsor_id ?? "",
    });
    setEditingId(r.id);
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
      emoji: form.emoji.trim(),
      label_es: form.label_es.trim(),
      label_en: form.label_en.trim(),
      sort_order: form.sort_order,
      match_id: form.match_id || null,
      sponsor_id: form.sponsor_id || null,
    };

    if (!payload.emoji || !payload.label_es || !payload.label_en) {
      setError("Emoji, label_es y label_en son obligatorios.");
      setSaving(false);
      return;
    }

    let result;
    if (editingId) {
      result = await supabase
        .from("reactions_config")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("reactions_config").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      closeForm();
      await fetchAll();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta reaccion? Si tiene reacciones asociadas, podria fallar.")) return;

    const { error } = await supabase.from("reactions_config").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      await fetchAll();
    }
  }

  async function handleToggleActive(id: string, currentValue: boolean) {
    const { error } = await supabase
      .from("reactions_config")
      .update({ is_active: !currentValue })
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setReactions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !currentValue } : r))
      );
    }
  }

  function matchLabel(matchId: string | null): string {
    if (!matchId) return "Global";
    const m = matches.find((x) => x.id === matchId);
    return m ? `${m.home_team} vs ${m.away_team}` : matchId.slice(0, 8);
  }

  function sponsorLabel(sponsorId: string | null): string {
    if (!sponsorId) return "—";
    const s = sponsors.find((x) => x.id === sponsorId);
    return s?.name ?? sponsorId.slice(0, 8);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reacciones</h1>
        <button
          onClick={openNew}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Nueva reaccion
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingId ? "Editar reaccion" : "Nueva reaccion"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Emoji *</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="⚽"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Orden</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Label ES *</label>
              <input
                type="text"
                value={form.label_es}
                onChange={(e) => setForm({ ...form, label_es: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="GOL"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Label EN *</label>
              <input
                type="text"
                value={form.label_en}
                onChange={(e) => setForm({ ...form, label_en: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="GOAL"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Partido (opcional, dejar vacio para global)
              </label>
              <select
                value={form.match_id}
                onChange={(e) => setForm({ ...form, match_id: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Global (todos los partidos)</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.home_team} vs {m.away_team}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Sponsor (opcional)
              </label>
              <select
                value={form.sponsor_id}
                onChange={(e) => setForm({ ...form, sponsor_id: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Sin sponsor</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
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
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear reaccion"}
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
          <p className="text-sm text-zinc-500">Cargando reacciones...</p>
        ) : reactions.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay reacciones configuradas.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400">
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Emoji</th>
                <th className="px-4 py-3 font-medium">ES</th>
                <th className="px-4 py-3 font-medium">EN</th>
                <th className="px-4 py-3 font-medium">Activa</th>
                <th className="px-4 py-3 font-medium">Partido</th>
                <th className="px-4 py-3 font-medium">Sponsor</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reactions.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-zinc-800 ${
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"
                  }`}
                >
                  <td className="px-4 py-3 text-zinc-400">{r.sort_order}</td>
                  <td className="px-4 py-3 text-2xl">{r.emoji}</td>
                  <td className="px-4 py-3 text-white">{r.label_es}</td>
                  <td className="px-4 py-3 text-white">{r.label_en}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(r.id, r.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        r.is_active ? "bg-emerald-600" : "bg-zinc-600"
                      }`}
                      aria-label={r.is_active ? "Desactivar" : "Activar"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          r.is_active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {matchLabel(r.match_id)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {sponsorLabel(r.sponsor_id)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
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
