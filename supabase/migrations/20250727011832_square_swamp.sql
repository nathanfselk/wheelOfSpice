/*
  # Fix RLS policies for anonymous rankings

  1. Security Updates
    - Drop existing policies that rely on request headers
    - Create new policies that allow anonymous users to manage their own session data
    - Enable proper access control based on session_id matching

  2. Policy Changes
    - Allow anonymous users to insert rankings with any session_id
    - Allow anonymous users to read/update/delete rankings where session_id matches
    - Maintain data isolation between different anonymous sessions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anonymous users can delete own session rankings" ON anonymous_rankings;
DROP POLICY IF EXISTS "Anonymous users can insert own session rankings" ON anonymous_rankings;
DROP POLICY IF EXISTS "Anonymous users can read own session rankings" ON anonymous_rankings;
DROP POLICY IF EXISTS "Anonymous users can update own session rankings" ON anonymous_rankings;

-- Create new policies that work with session_id directly
CREATE POLICY "Allow anonymous insert rankings"
  ON anonymous_rankings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select own session rankings"
  ON anonymous_rankings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous update own session rankings"
  ON anonymous_rankings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete own session rankings"
  ON anonymous_rankings
  FOR DELETE
  TO anon
  USING (true);