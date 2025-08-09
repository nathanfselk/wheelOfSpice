/*
  # Create user blends table

  1. New Tables
    - `user_blends`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `spices` (jsonb array of spice objects with percentages)
      - `flavor_profile` (text array)
      - `common_uses` (text array)
      - `similar_blends` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_blends` table
    - Add policies for authenticated users to manage their own blends
*/

CREATE TABLE IF NOT EXISTS user_blends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  spices jsonb NOT NULL,
  flavor_profile text[] DEFAULT '{}',
  common_uses text[] DEFAULT '{}',
  similar_blends text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_blends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own blends"
  ON user_blends
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blends"
  ON user_blends
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blends"
  ON user_blends
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blends"
  ON user_blends
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_blends_updated_at
  BEFORE UPDATE ON user_blends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_user_blends_user_id ON user_blends(user_id);
CREATE INDEX idx_user_blends_created_at ON user_blends(created_at DESC);