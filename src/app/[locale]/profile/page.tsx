import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProfileClient from "./ProfileClient";

interface ProfileData {
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  totalReactions: number;
  receipts: {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    homeCode: string;
    awayCode: string;
    homeScore: number;
    awayScore: number;
    kickoffAt: string;
    topEmoji: string;
    totalUserReactions: number;
  }[];
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}`);
  }

  // 2. Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, country_code")
    .eq("id", user.id)
    .single();

  // 3. Total reactions count
  const { count: totalReactions } = await supabaseAdmin
    .from("reactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 4. Get all receipts
  const { data: receipts } = await supabaseAdmin
    .from("receipts")
    .select("match_id, data, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Build receipt summaries
  const receiptSummaries = (receipts ?? []).map((r) => {
    const d = r.data as {
      match: {
        home_team: string;
        away_team: string;
        home_code: string;
        away_code: string;
        home_score: number;
        away_score: number;
        kickoff_at: string;
      };
      topReactions: { emoji: string; count: number }[];
      totalReactions: number;
    };

    return {
      matchId: r.match_id,
      homeTeam: d.match.home_team,
      awayTeam: d.match.away_team,
      homeCode: d.match.home_code,
      awayCode: d.match.away_code,
      homeScore: d.match.home_score,
      awayScore: d.match.away_score,
      kickoffAt: d.match.kickoff_at,
      topEmoji: d.topReactions?.[0]?.emoji ?? "",
      totalUserReactions: d.topReactions?.reduce(
        (acc: number, r: { count: number }) => acc + r.count,
        0
      ) ?? 0,
    };
  });

  const profileData: ProfileData = {
    displayName: profile?.display_name ?? "Usuario",
    avatarUrl: profile?.avatar_url ?? null,
    countryCode: profile?.country_code ?? null,
    totalReactions: totalReactions ?? 0,
    receipts: receiptSummaries,
  };

  return <ProfileClient data={profileData} locale={locale} />;
}
