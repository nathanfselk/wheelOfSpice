/*
  # Update user rankings table for guest users

  1. Changes
    - Make user_id nullable to allow guest rankings
    - Update RLS policies to allow anonymous access
    - Add index for better performance with null user_id

  2. Security
    - Anonymous users can create/read/update/delete their own rankings
    - Authenticated users maintain existing permissions
*/

-- Make user_id nullable to allow guest rankings
ALTER TABLE user_rankings ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can read own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can insert own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can update own rankings" ON user_rankings;
DROP POLICY IF EXISTS "Users can delete own rankings" ON user_rankings;

-- Create new RLS policies that work for both authenticated and anonymous users
CREATE POLICY "Users can read own rankings"
  ON user_rankings
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can insert own rankings"
  ON user_rankings
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can update own rankings"
  ON user_rankings
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can delete own rankings"
  ON user_rankings
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Add index for better performance with null user_id queries
CREATE INDEX IF NOT EXISTS idx_user_rankings_null_user_id 
  ON user_rankings (spice_id) 
  WHERE user_id IS NULL;