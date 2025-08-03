/*
  # Drop unused database tables

  1. Tables to Drop
    - `user_rankings` - No longer used for storing user rankings
    - `anonymous_rankings` - No longer used for anonymous user rankings  
    - `community_ratings` - No longer used for community rating aggregation

  2. Functions to Drop
    - All trigger functions related to the dropped tables

  3. Security
    - Clean removal of all related objects
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS update_community_rating_on_user_ranking_change ON user_rankings;
DROP TRIGGER IF EXISTS update_user_rankings_updated_at ON user_rankings;
DROP TRIGGER IF EXISTS update_community_rating_on_anon_ranking_change ON anonymous_rankings;
DROP TRIGGER IF EXISTS update_anonymous_rankings_updated_at ON anonymous_rankings;

-- Drop trigger functions
DROP FUNCTION IF EXISTS trigger_update_community_rating_user();
DROP FUNCTION IF EXISTS trigger_update_community_rating_anon();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_anonymous_rankings_updated_at();

-- Drop tables
DROP TABLE IF EXISTS user_rankings;
DROP TABLE IF EXISTS anonymous_rankings;
DROP TABLE IF EXISTS community_ratings;