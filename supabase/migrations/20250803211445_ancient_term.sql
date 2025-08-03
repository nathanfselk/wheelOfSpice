/*
  # Create user rankings table

  1. New Tables
    - `user_rankings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `spice_id` (text, spice identifier)
      - `rating` (numeric, 1-10 scale)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_rankings` table
    - Add policy for users to manage their own rankings
    - Add policy for users to read their own rankings

  3. Indexes
    - Unique constraint on user_id + spice_id
    - Index on user_id for fast lookups
*/

CREATE TABLE IF NOT EXISTS user_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spice_id text NOT NULL,
  rating numeric(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, spice_id)
);

ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

-- Users can read their own rankings
CREATE POLICY "Users can read own rankings"
  ON user_rankings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own rankings
CREATE POLICY "Users can insert own rankings"
  ON user_rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rankings
CREATE POLICY "Users can update own rankings"
  ON user_rankings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own rankings
CREATE POLICY "Users can delete own rankings"
  ON user_rankings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_rankings_updated_at
  BEFORE UPDATE ON user_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_spice_id ON user_rankings(spice_id);