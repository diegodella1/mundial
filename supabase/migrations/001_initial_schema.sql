-- ============================================================
-- PROFILES (public view of auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  country_code CHAR(2),
  locale CHAR(2) DEFAULT 'es',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'halftime', 'finished', 'postponed');

CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_code CHAR(3) NOT NULL,
  away_code CHAR(3) NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  kickoff_at TIMESTAMPTZ NOT NULL,
  status match_status DEFAULT 'scheduled',
  home_score SMALLINT DEFAULT 0,
  away_score SMALLINT DEFAULT 0,
  match_minute SMALLINT,
  api_football_id INTEGER,
  group_name TEXT,
  round TEXT,
  chat_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_kickoff ON matches(kickoff_at);

-- ============================================================
-- SPONSORS
-- ============================================================
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REACTIONS CONFIG (admin-configurable)
-- ============================================================
CREATE TABLE public.reactions_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REACTIONS (core dataset — NEVER DELETE)
-- ============================================================
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction_type UUID NOT NULL REFERENCES reactions_config(id),
  country_code CHAR(2),
  team_supported CHAR(3),
  match_minute SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reactions_match_created ON reactions(match_id, created_at DESC);
CREATE INDEX idx_reactions_match_country ON reactions(match_id, country_code);
CREATE INDEX idx_reactions_match_type ON reactions(match_id, reaction_type);
CREATE INDEX idx_reactions_match_minute ON reactions(match_id, match_minute);
CREATE INDEX idx_reactions_user_match ON reactions(user_id, match_id);

-- ============================================================
-- USER TEAM SELECTION (one per user per match)
-- ============================================================
CREATE TABLE public.user_match_teams (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  match_id UUID NOT NULL REFERENCES matches(id),
  team_code CHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, match_id)
);

-- ============================================================
-- MATCH EVENTS (from API-Football or manual)
-- ============================================================
CREATE TYPE event_type AS ENUM (
  'goal', 'own_goal', 'penalty_scored', 'penalty_missed',
  'yellow_card', 'red_card', 'substitution', 'var',
  'kickoff', 'halftime', 'fulltime'
);

CREATE TABLE public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  event_kind event_type NOT NULL,
  event_minute SMALLINT NOT NULL,
  team_code CHAR(3),
  player_name TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_match_events_match ON match_events(match_id, event_minute);

-- ============================================================
-- CHAT MESSAGES (ephemeral — deleted 24h post match)
-- ============================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  body TEXT NOT NULL CHECK (char_length(body) <= 280),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_match_created ON chat_messages(match_id, created_at DESC);

-- ============================================================
-- MODERATION
-- ============================================================
CREATE TABLE public.blocked_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  language CHAR(2) DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  match_id UUID NOT NULL REFERENCES matches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (message_id, reporter_id)
);

CREATE INDEX idx_reports_match ON chat_reports(match_id);

CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  match_id UUID REFERENCES matches(id),
  reason TEXT,
  banned_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bans_user ON user_bans(user_id, banned_until);

-- ============================================================
-- MATCH SPONSORS
-- ============================================================
CREATE TABLE public.match_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id),
  placement TEXT NOT NULL CHECK (placement IN ('header', 'receipt', 'both')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (match_id, sponsor_id)
);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_push_user ON push_subscriptions(user_id);

-- ============================================================
-- RECEIPTS (generated post-match)
-- ============================================================
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  match_id UUID NOT NULL REFERENCES matches(id),
  data JSONB NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, match_id)
);

CREATE INDEX idx_receipts_user ON receipts(user_id, created_at DESC);
