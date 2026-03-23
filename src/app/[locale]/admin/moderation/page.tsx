"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BlockedWord {
  id: string;
  word: string;
  language: string;
  created_at: string;
}

interface BannedUser {
  id: string;
  user_id: string;
  match_id: string | null;
  reason: string | null;
  banned_until: string;
  created_at: string;
  display_name?: string;
}

interface MatchRow {
  id: string;
  home_team: string;
  away_team: string;
  home_code: string;
  away_code: string;
  status: string;
  kickoff_at: string;
  chat_enabled: boolean;
}

export default function ModerationPage() {
  const [supabase] = useState(() => createClient());

  // Blocked Words state
  const [words, setWords] = useState<BlockedWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newLang, setNewLang] = useState("es");
  const [wordLoading, setWordLoading] = useState(false);

  // Banned Users state
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [banLoading, setBanLoading] = useState(false);

  // Matches (kill switch) state
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // --- Blocked Words ---
  const fetchWords = useCallback(async () => {
    const { data } = await supabase
      .from("blocked_words")
      .select("*")
      .order("word", { ascending: true });
    if (data) setWords(data as BlockedWord[]);
  }, [supabase]);

  const addWord = useCallback(async () => {
    const trimmed = newWord.trim().toLowerCase();
    if (!trimmed) return;
    setWordLoading(true);
    await supabase
      .from("blocked_words")
      .insert({ word: trimmed, language: newLang });
    setNewWord("");
    await fetchWords();
    setWordLoading(false);
  }, [supabase, newWord, newLang, fetchWords]);

  const deleteWord = useCallback(
    async (id: string) => {
      await supabase.from("blocked_words").delete().eq("id", id);
      setWords((prev) => prev.filter((w) => w.id !== id));
    },
    [supabase]
  );

  // --- Banned Users ---
  const fetchBans = useCallback(async () => {
    setBanLoading(true);
    const { data } = await supabase
      .from("user_bans")
      .select("*")
      .gt("banned_until", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profile display names
      const userIds = [...new Set(data.map((b) => b.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.id, p.display_name])
      );

      setBans(
        (data as BannedUser[]).map((b) => ({
          ...b,
          display_name: profileMap.get(b.user_id) || "Unknown",
        }))
      );
    }
    setBanLoading(false);
  }, [supabase]);

  const unbanUser = useCallback(
    async (banId: string) => {
      await supabase.from("user_bans").delete().eq("id", banId);
      setBans((prev) => prev.filter((b) => b.id !== banId));
    },
    [supabase]
  );

  // --- Matches Kill Switch ---
  const fetchMatches = useCallback(async () => {
    setMatchLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("id, home_team, away_team, home_code, away_code, status, kickoff_at, chat_enabled")
      .in("status", ["live", "halftime", "scheduled"])
      .order("kickoff_at", { ascending: true });
    if (data) setMatches(data as MatchRow[]);
    setMatchLoading(false);
  }, [supabase]);

  const toggleChat = useCallback(
    async (matchId: string, enabled: boolean) => {
      await supabase
        .from("matches")
        .update({ chat_enabled: enabled })
        .eq("id", matchId);
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId ? { ...m, chat_enabled: enabled } : m
        )
      );
    },
    [supabase]
  );

  // Fetch all on mount
  useEffect(() => {
    fetchWords();
    fetchBans();
    fetchMatches();
  }, [fetchWords, fetchBans, fetchMatches]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Moderacion</h1>

      {/* --- Blocked Words --- */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Palabras bloqueadas
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addWord();
            }}
            placeholder="Nueva palabra..."
            className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-600"
          />
          <select
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            className="rounded-lg bg-zinc-800 px-2 py-2 text-sm text-white outline-none"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button
            onClick={addWord}
            disabled={wordLoading || !newWord.trim()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
        <div className="rounded-xl bg-zinc-800 divide-y divide-zinc-700">
          {words.length === 0 && (
            <p className="p-4 text-sm text-zinc-500">
              No hay palabras bloqueadas.
            </p>
          )}
          {words.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-white font-mono">{w.word}</span>
                <span className="text-[10px] uppercase text-zinc-500 bg-zinc-700 px-1.5 py-0.5 rounded">
                  {w.language}
                </span>
              </div>
              <button
                onClick={() => deleteWord(w.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Banned Users --- */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Usuarios baneados
        </h2>
        {banLoading ? (
          <p className="text-sm text-zinc-500">Cargando...</p>
        ) : (
          <div className="rounded-xl bg-zinc-800 divide-y divide-zinc-700">
            {bans.length === 0 && (
              <p className="p-4 text-sm text-zinc-500">
                No hay usuarios baneados activos.
              </p>
            )}
            {bans.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white font-medium">
                    {b.display_name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {b.reason || "Sin razon"} — hasta{" "}
                    {new Date(b.banned_until).toLocaleString()}
                  </p>
                  {b.match_id && (
                    <p className="text-[10px] text-zinc-600">
                      Match: {b.match_id.slice(0, 8)}...
                    </p>
                  )}
                </div>
                <button
                  onClick={() => unbanUser(b.id)}
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  Desbanear
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Kill Switch --- */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Kill Switch — Chat por partido
        </h2>
        {matchLoading ? (
          <p className="text-sm text-zinc-500">Cargando...</p>
        ) : (
          <div className="rounded-xl bg-zinc-800 divide-y divide-zinc-700">
            {matches.length === 0 && (
              <p className="p-4 text-sm text-zinc-500">
                No hay partidos activos o programados.
              </p>
            )}
            {matches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white font-medium">
                    {m.home_team} vs {m.away_team}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {m.status} —{" "}
                    {new Date(m.kickoff_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleChat(m.id, !m.chat_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    m.chat_enabled ? "bg-green-600" : "bg-zinc-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      m.chat_enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
