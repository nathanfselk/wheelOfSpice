/*
  # Create anonymous rankings table

  1. New Tables
    - `anonymous_rankings`
      - `id` (uuid, primary key)
      - `session_id` (text, for grouping anonymous user rankings)
      - `spice_id` (text, references spice data)
      - `rating` (numeric, 1.0-10.0 scale)
      - `ranked_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `anonymous_rankings` table
    - Add policies for anonymous users to manage their own session rankings
    - Keep existing `user_rankings` table and RLS policies unchanged

  3. Indexes
    - Add index on session_id for performance
    - Add unique constraint on session_id + spice_id
*/

-- Create anonymous_rankings table
CREATE TABLE IF NOT EXISTS anonymous_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  spice_id text NOT NULL,
  rating numeric(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
  ranked_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, spice_id)
);

-- Enable RLS
ALTER TABLE anonymous_rankings ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
CREATE POLICY "Anonymous users can read own session rankings"
  ON anonymous_rankings
  FOR SELECT
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Anonymous users can insert own session rankings"
  ON anonymous_rankings
  FOR INSERT
  TO anon
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Anonymous users can update own session rankings"
  ON anonymous_rankings
  FOR UPDATE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Anonymous users can delete own session rankings"
  ON anonymous_rankings
  FOR DELETE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_rankings_session_id ON anonymous_rankings(session_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_anonymous_rankings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anonymous_rankings_updated_at
  BEFORE UPDATE ON anonymous_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_anonymous_rankings_updated_at();