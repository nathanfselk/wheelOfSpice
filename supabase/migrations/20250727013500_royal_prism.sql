/*
  # Create community ratings table

  1. New Tables
    - `community_ratings`
      - `spice_id` (text, primary key) - matches spice IDs from static data
      - `spice_name` (text) - name of the spice for easy reference
      - `community_rating` (numeric) - overall average rating across all users
      - `auth_rating` (numeric) - average rating from authenticated users only
      - `anon_rating` (numeric) - average rating from anonymous users only
      - `total_rates` (integer) - total number of ratings across all users
      - `auth_rates` (integer) - number of ratings from authenticated users
      - `anon_rates` (integer) - number of ratings from anonymous users
      - `updated_at` (timestamp) - when the record was last updated

  2. Security
    - Enable RLS on `community_ratings` table
    - Add policy for public read access (anyone can view community stats)
    - Add policy for service role to update (only backend can modify)

  3. Functions
    - Create function to recalculate and update community ratings
    - Create triggers to automatically update ratings when user rankings change
*/

CREATE TABLE IF NOT EXISTS community_ratings (
  spice_id text PRIMARY KEY,
  spice_name text NOT NULL,
  community_rating numeric(3,1) DEFAULT 0,
  auth_rating numeric(3,1) DEFAULT 0,
  anon_rating numeric(3,1) DEFAULT 0,
  total_rates integer DEFAULT 0,
  auth_rates integer DEFAULT 0,
  anon_rates integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read community ratings
CREATE POLICY "Allow public read access to community ratings"
  ON community_ratings
  FOR SELECT
  TO public
  USING (true);

-- Function to recalculate community ratings for a specific spice
CREATE OR REPLACE FUNCTION update_community_rating(target_spice_id text)
RETURNS void AS $$
DECLARE
  auth_avg numeric(3,1);
  auth_count integer;
  anon_avg numeric(3,1);
  anon_count integer;
  total_avg numeric(3,1);
  total_count integer;
  spice_name_val text;
BEGIN
  -- Get spice name from first available source
  SELECT name INTO spice_name_val FROM (
    SELECT target_spice_id as name
  ) as temp;
  
  -- Calculate authenticated user stats
  SELECT 
    COALESCE(ROUND(AVG(rating), 1), 0),
    COALESCE(COUNT(*), 0)
  INTO auth_avg, auth_count
  FROM user_rankings 
  WHERE spice_id = target_spice_id;
  
  -- Calculate anonymous user stats  
  SELECT 
    COALESCE(ROUND(AVG(rating), 1), 0),
    COALESCE(COUNT(*), 0)
  INTO anon_avg, anon_count
  FROM anonymous_rankings 
  WHERE spice_id = target_spice_id;
  
  -- Calculate overall stats
  total_count := auth_count + anon_count;
  
  IF total_count > 0 THEN
    SELECT ROUND(
      (COALESCE((SELECT SUM(rating) FROM user_rankings WHERE spice_id = target_spice_id), 0) + 
       COALESCE((SELECT SUM(rating) FROM anonymous_rankings WHERE spice_id = target_spice_id), 0)) 
      / total_count, 1
    ) INTO total_avg;
  ELSE
    total_avg := 0;
  END IF;
  
  -- Upsert the community rating record
  INSERT INTO community_ratings (
    spice_id, 
    spice_name, 
    community_rating, 
    auth_rating, 
    anon_rating, 
    total_rates, 
    auth_rates, 
    anon_rates,
    updated_at
  ) VALUES (
    target_spice_id,
    target_spice_id, -- Using spice_id as name for now
    total_avg,
    auth_avg,
    anon_avg,
    total_count,
    auth_count,
    anon_count,
    now()
  )
  ON CONFLICT (spice_id) 
  DO UPDATE SET
    community_rating = EXCLUDED.community_rating,
    auth_rating = EXCLUDED.auth_rating,
    anon_rating = EXCLUDED.anon_rating,
    total_rates = EXCLUDED.total_rates,
    auth_rates = EXCLUDED.auth_rates,
    anon_rates = EXCLUDED.anon_rates,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Trigger function for user_rankings changes
CREATE OR REPLACE FUNCTION trigger_update_community_rating_user()
RETURNS trigger AS $$
BEGIN
  -- Handle both INSERT/UPDATE and DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM update_community_rating(OLD.spice_id);
    RETURN OLD;
  ELSE
    PERFORM update_community_rating(NEW.spice_id);
    -- If this was an update and spice_id changed, update old spice too
    IF TG_OP = 'UPDATE' AND OLD.spice_id != NEW.spice_id THEN
      PERFORM update_community_rating(OLD.spice_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for anonymous_rankings changes
CREATE OR REPLACE FUNCTION trigger_update_community_rating_anon()
RETURNS trigger AS $$
BEGIN
  -- Handle both INSERT/UPDATE and DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM update_community_rating(OLD.spice_id);
    RETURN OLD;
  ELSE
    PERFORM update_community_rating(NEW.spice_id);
    -- If this was an update and spice_id changed, update old spice too
    IF TG_OP = 'UPDATE' AND OLD.spice_id != NEW.spice_id THEN
      PERFORM update_community_rating(OLD.spice_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_community_rating_on_user_ranking_change
  AFTER INSERT OR UPDATE OR DELETE ON user_rankings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_community_rating_user();

CREATE TRIGGER update_community_rating_on_anon_ranking_change
  AFTER INSERT OR UPDATE OR DELETE ON anonymous_rankings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_community_rating_anon();