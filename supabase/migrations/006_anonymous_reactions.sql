-- Allow anonymous reactions (no login required for core experience)
ALTER TABLE reactions ALTER COLUMN user_id DROP NOT NULL;
