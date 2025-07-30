/*
  # Create user rankings table

  1. New Tables
    - `user_rankings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `spice_id` (text, references spice data)
      - `rating` (decimal, user's rating 1-10)
      - `ranked_at` (timestamp, when the ranking was created)
      - `updated_at` (timestamp, when the ranking was last updated)

  2. Security
    - Enable RLS on `user_rankings` table
    - Add policy for users to read/write their own rankings only
*/

CREATE TABLE IF NOT EXISTS user_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spice_id text NOT NULL,
  rating decimal(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
  ranked_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, spice_id)
);

ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own rankings
CREATE POLICY "Users can read own rankings"
  ON user_rankings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own rankings
CREATE POLICY "Users can insert own rankings"
  ON user_rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own rankings
CREATE POLICY "Users can update own rankings"
  ON user_rankings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own rankings
CREATE POLICY "Users can delete own rankings"
  ON user_rankings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
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