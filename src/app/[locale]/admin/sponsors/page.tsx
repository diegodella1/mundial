"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  created_at: string;
};

type Match = {
  id: string;
  home_team: string;
  away_team: string;
};

type MatchSponsor = {
  id: string;
  match_id: string;
  sponsor_id: string;
  placement: string;
  created_at: string;
};

type SponsorForm = {
  name: string;
  logo_url: string;
  website_url: string;
};

const EMPTY_SPONSOR: SponsorForm = {
  name: "",
  logo_url: "",
  website_url: "",
};

const PLACEMENTS = [
  { value: "header", label: "Header" },
  { value: "receipt", label: "Receipt" },
  { value: "both", label: "Ambos" },
];

export default function SponsorsPage() {
  const supabase = createClient();

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchSponsors, setMatchSponsors] = useState<MatchSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sponsor form
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponsorForm, setSponsorForm] = useState<SponsorForm>(EMPTY_SPONSOR);
  const [saving, setSaving] = useState(false);

  // Match-sponsor assignment form
  const [assignMatchId, setAssignMatchId] = useState("");
  const [assignSponsorId, setAssignSponsorId] = useState("");
  const [assignPlacement, setAssignPlacement] = useState("header");
  const [assigning, setAssigning] = useState(false);

  async function fetchAll() {
    setLoading(true);
    const [sponsorsRes, matchesRes, msRes] = await Promise.all([
      supabase.from("sponsors").select("*").order("name"),
      supabase
        .from("matches")
        .select("id, home_team, away_team")
        .order("kickoff_at", { ascending: false }),
      supabase.from("match_sponsors").select("*").order("created_at", { ascending: false }),
    ]);

    if (sponsorsRes.error) setError(sponsorsRes.error.message);
    else setSponsors(sponsorsRes.data ?? []);

    setMatches(matchesRes.data ?? []);
    setMatchSponsors(msRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Sponsor CRUD ----

  function openNewSponsor() {
    setSponsorForm(EMPTY_SPONSOR);
    setEditingSponsorId(null);
    setShowSponsorForm(true);
    setError(null);
  }

  function openEditSponsor(s: Sponsor) {
    setSponsorForm({
      name: s.name,
      logo_url: s.logo_url ?? "",
      website_url: s.website_url ?? "",
    });
    setEditingSponsorId(s.id);
    setShowSponsorForm(true);
    setError(null);
  }

  function closeSponsorForm() {
    setShowSponsorForm(false);
    setEditingSponsorId(null);
    setSponsorForm(EMPTY_SPONSOR);
    setError(null);
  }

  async function handleSaveSponsor() {
    setSaving(true);
    setError(null);

    const payload = {
      name: sponsorForm.name.trim(),
      logo_url: sponsorForm.logo_url.trim() || null,
      website_url: sponsorForm.website_url.trim() || null,
    };

    if (!payload.name) {
      setError("El nombre es obligatorio.");
      setSaving(false);
      return;
    }

    let result;
    if (editingSponsorId) {
      result = await supabase
        .from("sponsors")
        .update(payload)
        .eq("id", editingSponsorId);
    } else {
      result = await supabase.from("sponsors").insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      closeSponsorForm();
      await fetchAll();
    }
    setSaving(false);
  }

  async function handleDeleteSponsor(id: string) {
    if (!confirm("Eliminar este sponsor?")) return;

    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      await fetchAll();
    }
  }

  // ---- Match-Sponsor Assignments ----

  async function handleAssign() {
    if (!assignMatchId || !assignSponsorId) {
      setError("Seleccionar partido y sponsor.");
      return;
    }

    setAssigning(true);
    setError(null);

    const { error } = await supabase.from("match_sponsors").insert({
      match_id: assignMatchId,
      sponsor_id: assignSponsorId,
      placement: assignPlacement,
    });

    if (error) {
      setError(error.message);
    } else {
      setAssignMatchId("");
      setAssignSponsorId("");
      setAssignPlacement("header");
      await fetchAll();
    }
    setAssigning(false);
  }

  async function handleDeleteAssignment(id: string) {
    if (!confirm("Eliminar esta asignacion?")) return;

    const { error } = await supabase.from("match_sponsors").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      await fetchAll();
    }
  }

  function matchLabel(matchId: string): string {
    const m = matches.find((x) => x.id === matchId);
    return m ? `${m.home_team} vs ${m.away_team}` : matchId.slice(0, 8);
  }

  function sponsorLabel(sponsorId: string): string {
    const s = sponsors.find((x) => x.id === sponsorId);
    return s?.name ?? sponsorId.slice(0, 8);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sponsors</h1>
        <button
          onClick={openNewSponsor}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Nuevo sponsor
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Sponsor Form */}
      {showSponsorForm && (
        <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingSponsorId ? "Editar sponsor" : "Nuevo sponsor"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-zinc-400">Nombre *</label>
              <input
                type="text"
                value={sponsorForm.name}
                onChange={(e) =>
                  setSponsorForm({ ...sponsorForm, name: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="Coca-Cola"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Logo URL</label>
              <input
                type="text"
                value={sponsorForm.logo_url}
                onChange={(e) =>
                  setSponsorForm({ ...sponsorForm, logo_url: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Website URL</label>
              <input
                type="text"
                value={sponsorForm.website_url}
                onChange={(e) =>
                  setSponsorForm({ ...sponsorForm, website_url: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSaveSponsor}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : editingSponsorId
                  ? "Guardar cambios"
                  : "Crear sponsor"}
            </button>
            <button
              onClick={closeSponsorForm}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sponsors Table */}
      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-zinc-500">Cargando sponsors...</p>
        ) : sponsors.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay sponsors.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Logo</th>
                <th className="px-4 py-3 font-medium">Website</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-zinc-800 ${
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                  <td className="px-4 py-3">
                    {s.logo_url ? (
                      <img
                        src={s.logo_url}
                        alt={s.name}
                        className="h-8 w-8 rounded object-contain"
                      />
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.website_url ? (
                      <a
                        href={s.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline"
                      >
                        {new URL(s.website_url).hostname}
                      </a>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditSponsor(s)}
                        className="text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSponsor(s.id)}
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

      {/* Match-Sponsor Assignments */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-white">Asignaciones Partido-Sponsor</h2>

        {/* Assignment form */}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-700 bg-zinc-800 p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-zinc-400">Partido</label>
            <select
              value={assignMatchId}
              onChange={(e) => setAssignMatchId(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Seleccionar partido...</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.home_team} vs {m.away_team}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm text-zinc-400">Sponsor</label>
            <select
              value={assignSponsorId}
              onChange={(e) => setAssignSponsorId(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Seleccionar sponsor...</option>
              {sponsors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="mb-1 block text-sm text-zinc-400">Ubicacion</label>
            <select
              value={assignPlacement}
              onChange={(e) => setAssignPlacement(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssign}
            disabled={assigning}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {assigning ? "Asignando..." : "Asignar"}
          </button>
        </div>

        {/* Assignments list */}
        <div className="mt-4 overflow-x-auto">
          {matchSponsors.length === 0 ? (
            <p className="text-sm text-zinc-500">No hay asignaciones.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="px-4 py-3 font-medium">Partido</th>
                  <th className="px-4 py-3 font-medium">Sponsor</th>
                  <th className="px-4 py-3 font-medium">Ubicacion</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {matchSponsors.map((ms, i) => (
                  <tr
                    key={ms.id}
                    className={`border-b border-zinc-800 ${
                      i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-white">
                      {matchLabel(ms.match_id)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {sponsorLabel(ms.sponsor_id)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{ms.placement}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteAssignment(ms.id)}
                        className="text-sm text-red-400 transition-colors hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
