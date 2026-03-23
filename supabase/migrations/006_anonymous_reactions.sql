-- Allow anonymous reactions (no login required for core experience)
ALTER TABLE reactions ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous inserts via anon key
CREATE POLICY "reactions_insert_anon" ON reactions FOR INSERT WITH CHECK (true);
