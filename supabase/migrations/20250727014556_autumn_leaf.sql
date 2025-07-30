/*
  # Add triggers to update community_ratings table

  1. Functions
    - `update_community_rating(spice_id)` - recalculates community stats for a spice
    - `trigger_update_community_rating_user()` - trigger function for user_rankings changes
    - `trigger_update_community_rating_anon()` - trigger function for anonymous_rankings changes
    - `update_updated_at_column()` - updates the updated_at timestamp

  2. Triggers
    - Updates community_ratings whenever user_rankings or anonymous_rankings change
    - Handles INSERT, UPDATE, DELETE operations
    - Automatically maintains accurate community statistics

  3. Security
    - Functions are security definer to allow proper access
    - Maintains data integrity across all operations
*/

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at for anonymous_rankings
CREATE OR REPLACE FUNCTION update_anonymous_rankings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate community rating for a specific spice
CREATE OR REPLACE FUNCTION update_community_rating(target_spice_id text)
RETURNS void AS $$
DECLARE
  auth_avg numeric(3,1) := 0;
  anon_avg numeric(3,1) := 0;
  auth_count integer := 0;
  anon_count integer := 0;
  total_avg numeric(3,1) := 0;
  total_count integer := 0;
  spice_name_val text;
BEGIN
  -- Get spice name from static data (we'll use the spice_id as fallback)
  spice_name_val := target_spice_id;
  
  -- Calculate authenticated user stats
  SELECT 
    COALESCE(AVG(rating), 0)::numeric(3,1),
    COUNT(*)::integer
  INTO auth_avg, auth_count
  FROM user_rankings 
  WHERE spice_id = target_spice_id;
  
  -- Calculate anonymous user stats
  SELECT 
    COALESCE(AVG(rating), 0)::numeric(3,1),
    COUNT(*)::integer
  INTO anon_avg, anon_count
  FROM anonymous_rankings 
  WHERE spice_id = target_spice_id;
  
  -- Calculate overall community average
  IF (auth_count + anon_count) > 0 THEN
    SELECT 
      ((COALESCE(auth_avg * auth_count, 0) + COALESCE(anon_avg * anon_count, 0)) / (auth_count + anon_count))::numeric(3,1)
    INTO total_avg;
  END IF;
  
  total_count := auth_count + anon_count;
  
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
    spice_name_val,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for user_rankings changes
CREATE OR REPLACE FUNCTION trigger_update_community_rating_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for anonymous_rankings changes
CREATE OR REPLACE FUNCTION trigger_update_community_rating_anon()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for user_rankings
DROP TRIGGER IF EXISTS update_community_rating_on_user_ranking_change ON user_rankings;
CREATE TRIGGER update_community_rating_on_user_ranking_change
  AFTER INSERT OR UPDATE OR DELETE ON user_rankings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_community_rating_user();

-- Create triggers for anonymous_rankings  
DROP TRIGGER IF EXISTS update_community_rating_on_anon_ranking_change ON anonymous_rankings;
CREATE TRIGGER update_community_rating_on_anon_ranking_change
  AFTER INSERT OR UPDATE OR DELETE ON anonymous_rankings
  FOR EACH ROW EXECUTE FUNCTION trigger_update_community_rating_anon();

-- Create trigger for updating updated_at on user_rankings
DROP TRIGGER IF EXISTS update_user_rankings_updated_at ON user_rankings;
CREATE TRIGGER update_user_rankings_updated_at
  BEFORE UPDATE ON user_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating updated_at on anonymous_rankings
DROP TRIGGER IF EXISTS update_anonymous_rankings_updated_at ON anonymous_rankings;
CREATE TRIGGER update_anonymous_rankings_updated_at
  BEFORE UPDATE ON anonymous_rankings
  FOR EACH ROW EXECUTE FUNCTION update_anonymous_rankings_updated_at();