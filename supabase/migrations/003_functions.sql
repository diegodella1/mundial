-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'Usuario'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Aggregation for map state (called by server cron every 5s)
-- Returns country_code, reaction count, and top emoji for last N seconds
-- ============================================================
CREATE OR REPLACE FUNCTION public.aggregate_reactions(p_seconds INTEGER DEFAULT 60)
RETURNS TABLE(country_code CHAR(2), reaction_count BIGINT, top_emoji TEXT) AS $$
  WITH recent AS (
    SELECT r.country_code, r.reaction_type, COUNT(*) as cnt
    FROM reactions r
    WHERE r.created_at > now() - make_interval(secs => p_seconds)
      AND r.country_code IS NOT NULL
    GROUP BY r.country_code, r.reaction_type
  ),
  ranked AS (
    SELECT
      country_code,
      reaction_type,
      cnt,
      ROW_NUMBER() OVER (PARTITION BY country_code ORDER BY cnt DESC) as rn
    FROM recent
  ),
  top_per_country AS (
    SELECT country_code, reaction_type
    FROM ranked
    WHERE rn = 1
  )
  SELECT
    r.country_code,
    SUM(r.cnt)::BIGINT as reaction_count,
    rc.emoji as top_emoji
  FROM recent r
  JOIN top_per_country t ON t.country_code = r.country_code
  JOIN reactions_config rc ON rc.id = t.reaction_type
  GROUP BY r.country_code, rc.emoji;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- Auto-ban: 3 reports in match = match ban, 5 total = global ban
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_auto_ban()
RETURNS TRIGGER AS $$
DECLARE
  v_reported_user_id UUID;
  v_match_report_count INTEGER;
  v_total_report_count INTEGER;
BEGIN
  -- Get the user who wrote the reported message
  SELECT user_id INTO v_reported_user_id
  FROM chat_messages WHERE id = NEW.message_id;

  -- Count distinct reporters for this user in this match
  SELECT COUNT(DISTINCT cr.reporter_id) INTO v_match_report_count
  FROM chat_reports cr
  JOIN chat_messages cm ON cm.id = cr.message_id
  WHERE cm.user_id = v_reported_user_id
    AND cr.match_id = NEW.match_id;

  -- 3 reports in match = ban for rest of match
  IF v_match_report_count >= 3 THEN
    INSERT INTO user_bans (user_id, match_id, reason, banned_until)
    VALUES (
      v_reported_user_id,
      NEW.match_id,
      'auto: 3 reports in match',
      (SELECT kickoff_at + INTERVAL '4 hours' FROM matches WHERE id = NEW.match_id)
    )
    ON CONFLICT DO NOTHING;

    -- Block all their messages in this match
    UPDATE chat_messages SET is_blocked = true
    WHERE user_id = v_reported_user_id AND match_id = NEW.match_id;
  END IF;

  -- Count total historical reports
  SELECT COUNT(DISTINCT cr.reporter_id) INTO v_total_report_count
  FROM chat_reports cr
  JOIN chat_messages cm ON cm.id = cr.message_id
  WHERE cm.user_id = v_reported_user_id;

  -- 5 total = global ban for 7 days
  IF v_total_report_count >= 5 THEN
    INSERT INTO user_bans (user_id, reason, banned_until)
    VALUES (
      v_reported_user_id,
      'auto: 5+ total reports',
      now() + INTERVAL '7 days'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chat_report
  AFTER INSERT ON chat_reports
  FOR EACH ROW EXECUTE FUNCTION public.check_auto_ban();

-- ============================================================
-- Chat cleanup (called periodically by server cron)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_chat()
RETURNS void AS $$
BEGIN
  -- Delete non-blocked messages 24h after match finished
  DELETE FROM chat_messages cm
  USING matches m
  WHERE m.id = cm.match_id
    AND m.status = 'finished'
    AND cm.is_blocked = false
    AND m.kickoff_at < now() - INTERVAL '24 hours';

  -- Delete blocked messages 7 days after match finished (audit period)
  DELETE FROM chat_messages cm
  USING matches m
  WHERE m.id = cm.match_id
    AND m.status = 'finished'
    AND cm.is_blocked = true
    AND m.kickoff_at < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
