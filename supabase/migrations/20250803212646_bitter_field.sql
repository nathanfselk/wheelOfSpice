/*
  # Fix RLS policies for community_ratings table

  1. Security Changes
    - Update RLS policies to allow database triggers to modify community_ratings
    - Add policy for service role to insert/update/delete community ratings
    - Ensure triggers can execute with proper permissions

  2. Database Functions
    - Update trigger functions to use SECURITY DEFINER
    - Allow automatic updates from user_rankings triggers
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Anyone can read community ratings" ON community_ratings;

-- Create new policies that allow both public read access and service role modifications
CREATE POLICY "Public can read community ratings"
  ON community_ratings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage community ratings"
  ON community_ratings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Recreate the trigger function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION refresh_community_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Handle both INSERT/UPDATE and DELETE cases
  DECLARE
    target_spice_id TEXT;
  BEGIN
    -- Determine which spice_id to update
    IF TG_OP = 'DELETE' THEN
      target_spice_id := OLD.spice_id;
    ELSE
      target_spice_id := NEW.spice_id;
    END IF;

    -- Recalculate community rating for the affected spice
    INSERT INTO community_ratings (spice_id, average_rating, total_ratings, rating_sum, updated_at)
    SELECT 
      target_spice_id,
      ROUND(AVG(rating), 2) as average_rating,
      COUNT(*) as total_ratings,
      SUM(rating) as rating_sum,
      NOW() as updated_at
    FROM user_rankings 
    WHERE spice_id = target_spice_id
    ON CONFLICT (spice_id) 
    DO UPDATE SET
      average_rating = EXCLUDED.average_rating,
      total_ratings = EXCLUDED.total_ratings,
      rating_sum = EXCLUDED.rating_sum,
      updated_at = EXCLUDED.updated_at;

    -- If no ratings exist after DELETE, remove the community rating
    IF TG_OP = 'DELETE' AND NOT EXISTS (
      SELECT 1 FROM user_rankings WHERE spice_id = target_spice_id
    ) THEN
      DELETE FROM community_ratings WHERE spice_id = target_spice_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
  END;
END;
$$;

-- Ensure the trigger exists with the updated function
DROP TRIGGER IF EXISTS trigger_refresh_community_rating ON user_rankings;
CREATE TRIGGER trigger_refresh_community_rating
  AFTER INSERT OR UPDATE OR DELETE ON user_rankings
  FOR EACH ROW EXECUTE FUNCTION refresh_community_rating();