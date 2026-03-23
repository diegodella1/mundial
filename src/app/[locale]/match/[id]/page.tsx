import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Match } from "@/lib/matches";
import MatchPageClient from "./MatchPageClient";

interface ReactionConfig {
  id: string;
  emoji: string;
  label_es: string;
  label_en: string;
  sponsor_id: string | null;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch match data
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (!match) {
    notFound();
  }

  // Fetch reactions config: match-specific + global (match_id IS NULL)
  const { data: reactions } = await supabase
    .from("reactions_config")
    .select("id, emoji, label_es, label_en, sponsor_id")
    .eq("is_active", true)
    .or(`match_id.eq.${id},match_id.is.null`)
    .order("sort_order", { ascending: true });

  // Check if user is logged in and has a team selected
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userTeamCode: string | null = null;
  if (user) {
    const { data: teamSelection } = await supabase
      .from("user_match_teams")
      .select("team_code")
      .eq("user_id", user.id)
      .eq("match_id", id)
      .single();

    userTeamCode = teamSelection?.team_code ?? null;
  }

  return (
    <div className="flex flex-col min-h-screen pt-14">
      {/* Top 30%: transparent area (map shows through) */}
      <div className="h-[30vh] flex-shrink-0" />

      {/* Bottom 70%: match content */}
      <div className="flex-1 bg-zinc-950/90 backdrop-blur-lg rounded-t-3xl px-4 py-6">
        <MatchPageClient
          match={match as Match}
          reactions={(reactions as ReactionConfig[]) ?? []}
          initialTeamCode={userTeamCode}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
