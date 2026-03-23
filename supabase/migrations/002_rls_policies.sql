-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_match_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- PROFILES: anyone reads, user updates own
-- ============================================================
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- MATCHES: public read, admin write
-- ============================================================
CREATE POLICY "matches_select" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_insert" ON matches FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "matches_update" ON matches FOR UPDATE USING (is_admin());
CREATE POLICY "matches_delete" ON matches FOR DELETE USING (is_admin());

-- ============================================================
-- REACTIONS CONFIG: public read, admin write
-- ============================================================
CREATE POLICY "rconfig_select" ON reactions_config FOR SELECT USING (true);
CREATE POLICY "rconfig_insert" ON reactions_config FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "rconfig_update" ON reactions_config FOR UPDATE USING (is_admin());
CREATE POLICY "rconfig_delete" ON reactions_config FOR DELETE USING (is_admin());

-- ============================================================
-- REACTIONS: public read, authenticated insert (NO update/delete)
-- ============================================================
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- USER MATCH TEAMS: user manages own
-- ============================================================
CREATE POLICY "umt_select" ON user_match_teams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "umt_insert" ON user_match_teams FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MATCH EVENTS: public read, admin write
-- ============================================================
CREATE POLICY "events_select" ON match_events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON match_events FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "events_update" ON match_events FOR UPDATE USING (is_admin());
CREATE POLICY "events_delete" ON match_events FOR DELETE USING (is_admin());

-- ============================================================
-- CHAT: read non-blocked (or admin reads all), authenticated insert
-- ============================================================
CREATE POLICY "chat_select" ON chat_messages FOR SELECT
  USING (is_blocked = false OR is_admin());
CREATE POLICY "chat_insert" ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BLOCKED WORDS: admin only (read needed by service role for filtering)
-- ============================================================
CREATE POLICY "bw_select" ON blocked_words FOR SELECT USING (is_admin());
CREATE POLICY "bw_insert" ON blocked_words FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "bw_update" ON blocked_words FOR UPDATE USING (is_admin());
CREATE POLICY "bw_delete" ON blocked_words FOR DELETE USING (is_admin());

-- ============================================================
-- CHAT REPORTS: authenticated insert, admin read
-- ============================================================
CREATE POLICY "reports_insert" ON chat_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select" ON chat_reports FOR SELECT USING (is_admin());

-- ============================================================
-- USER BANS: user checks own, admin manages all
-- ============================================================
CREATE POLICY "bans_select_own" ON user_bans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bans_select_admin" ON user_bans FOR SELECT USING (is_admin());
CREATE POLICY "bans_insert" ON user_bans FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "bans_update" ON user_bans FOR UPDATE USING (is_admin());
CREATE POLICY "bans_delete" ON user_bans FOR DELETE USING (is_admin());

-- ============================================================
-- SPONSORS: public read, admin write
-- ============================================================
CREATE POLICY "sponsors_select" ON sponsors FOR SELECT USING (true);
CREATE POLICY "sponsors_insert" ON sponsors FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "sponsors_update" ON sponsors FOR UPDATE USING (is_admin());
CREATE POLICY "sponsors_delete" ON sponsors FOR DELETE USING (is_admin());

CREATE POLICY "msponsor_select" ON match_sponsors FOR SELECT USING (true);
CREATE POLICY "msponsor_insert" ON match_sponsors FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "msponsor_update" ON match_sponsors FOR UPDATE USING (is_admin());
CREATE POLICY "msponsor_delete" ON match_sponsors FOR DELETE USING (is_admin());

-- ============================================================
-- PUSH: user manages own
-- ============================================================
CREATE POLICY "push_select" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_insert" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_delete" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RECEIPTS: user reads own, admin reads all
-- ============================================================
CREATE POLICY "receipts_select_own" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_select_admin" ON receipts FOR SELECT USING (is_admin());
CREATE POLICY "receipts_insert" ON receipts FOR INSERT WITH CHECK (is_admin());
