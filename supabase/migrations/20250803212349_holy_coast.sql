/*
  # Community Ratings System

  1. New Tables
    - `community_ratings`
      - `spice_id` (text, primary key) - References the spice ID
      - `average_rating` (numeric) - Community average rating for the spice
      - `total_ratings` (integer) - Total number of ratings for this spice
      - `rating_sum` (numeric) - Sum of all ratings (for efficient calculation)
      - `updated_at` (timestamp) - When the community rating was last updated

  2. Functions
    - `update_community_rating()` - Recalculates community rating for a spice
    - `refresh_community_rating()` - Trigger function to update ratings automatically

  3. Triggers
    - Auto-update community ratings when user rankings change

  4. Security
    - Enable RLS on community_ratings table
    - Allow public read access to community ratings
    - Only allow system updates (no direct user modifications)
*/

-- Create community_ratings table
CREATE TABLE IF NOT EXISTS community_ratings (
  spice_id text PRIMARY KEY,
  average_rating numeric(4,2) DEFAULT 0.00,
  total_ratings integer DEFAULT 0,
  rating_sum numeric(10,2) DEFAULT 0.00,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read community ratings
CREATE POLICY "Anyone can read community ratings"
  ON community_ratings
  FOR SELECT
  TO public
  USING (true);

-- Function to update community rating for a specific spice
CREATE OR REPLACE FUNCTION update_community_rating(target_spice_id text)
RETURNS void AS $$
BEGIN
  -- Calculate new community rating stats
  INSERT INTO community_ratings (spice_id, average_rating, total_ratings, rating_sum, updated_at)
  SELECT 
    target_spice_id,
    COALESCE(AVG(rating), 0)::numeric(4,2),
    COUNT(*)::integer,
    COALESCE(SUM(rating), 0)::numeric(10,2),
    now()
  FROM user_rankings 
  WHERE spice_id = target_spice_id
  ON CONFLICT (spice_id) 
  DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_ratings = EXCLUDED.total_ratings,
    rating_sum = EXCLUDED.rating_sum,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh community rating (trigger function)
CREATE OR REPLACE FUNCTION refresh_community_rating()
RETURNS trigger AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_community_rating(NEW.spice_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM update_community_rating(OLD.spice_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update community ratings
DROP TRIGGER IF EXISTS trigger_refresh_community_rating ON user_rankings;
CREATE TRIGGER trigger_refresh_community_rating
  AFTER INSERT OR UPDATE OR DELETE ON user_rankings
  FOR EACH ROW
  EXECUTE FUNCTION refresh_community_rating();

-- Initialize community ratings for existing data
DO $$
DECLARE
  spice_record RECORD;
BEGIN
  -- Get all unique spice IDs from user_rankings
  FOR spice_record IN 
    SELECT DISTINCT spice_id FROM user_rankings
  LOOP
    PERFORM update_community_rating(spice_record.spice_id);
  END LOOP;
END $$;