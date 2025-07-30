/*
  # Fix RLS policies for community_ratings table

  1. Security Changes
    - Drop existing restrictive policies
    - Add new policies that allow public access for initialization
    - Enable proper access for both anonymous and authenticated users

  2. Policy Details
    - Allow public SELECT access to read community ratings
    - Allow public INSERT access for initialization
    - Allow public UPDATE access for trigger updates
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to community ratings" ON community_ratings;
DROP POLICY IF EXISTS "Allow public insert access to community ratings" ON community_ratings;
DROP POLICY IF EXISTS "Allow public update access to community ratings" ON community_ratings;

-- Create new policies that allow proper access
CREATE POLICY "Enable read access for all users" ON community_ratings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON community_ratings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON community_ratings
  FOR UPDATE USING (true) WITH CHECK (true);