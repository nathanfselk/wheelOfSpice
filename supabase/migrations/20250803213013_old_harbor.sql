/*
  # Add spice name to community_ratings table

  1. Schema Changes
    - Add `spice_name` column to `community_ratings` table
    - Populate existing records with spice names from the spices data
    - Update the refresh_community_rating function to include spice name

  2. Function Updates
    - Modified trigger function to set spice_name when updating community ratings
    - Uses a lookup table approach to map spice_id to spice_name

  3. Data Population
    - Populates existing community_ratings records with correct spice names
*/

-- Add spice_name column to community_ratings table
ALTER TABLE community_ratings ADD COLUMN IF NOT EXISTS spice_name text;

-- Create a temporary function to get spice name by ID
CREATE OR REPLACE FUNCTION get_spice_name(spice_id_param text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  CASE spice_id_param
    WHEN '1' THEN RETURN 'Cinnamon';
    WHEN '2' THEN RETURN 'Black Pepper';
    WHEN '3' THEN RETURN 'Turmeric';
    WHEN '4' THEN RETURN 'Cumin';
    WHEN '5' THEN RETURN 'Paprika';
    WHEN '6' THEN RETURN 'Cardamom';
    WHEN '7' THEN RETURN 'Cloves';
    WHEN '8' THEN RETURN 'Nutmeg';
    WHEN '9' THEN RETURN 'Ginger';
    WHEN '10' THEN RETURN 'Star Anise';
    WHEN '11' THEN RETURN 'Coriander';
    WHEN '12' THEN RETURN 'Fennel Seeds';
    WHEN '13' THEN RETURN 'Saffron';
    WHEN '14' THEN RETURN 'Allspice';
    WHEN '15' THEN RETURN 'Bay Leaves';
    WHEN '16' THEN RETURN 'Chili Powder';
    WHEN '17' THEN RETURN 'Mustard Seeds';
    WHEN '18' THEN RETURN 'Oregano';
    WHEN '19' THEN RETURN 'Thyme';
    WHEN '20' THEN RETURN 'Rosemary';
    WHEN '21' THEN RETURN 'Basil';
    WHEN '22' THEN RETURN 'Sage';
    WHEN '23' THEN RETURN 'Vanilla';
    WHEN '24' THEN RETURN 'Cayenne Pepper';
    WHEN '25' THEN RETURN 'Garlic Powder';
    ELSE RETURN 'Unknown Spice';
  END CASE;
END;
$$;

-- Update existing records with spice names
UPDATE community_ratings 
SET spice_name = get_spice_name(spice_id)
WHERE spice_name IS NULL;

-- Update the refresh_community_rating function to include spice_name
CREATE OR REPLACE FUNCTION refresh_community_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_spice_id text;
  new_avg numeric(4,2);
  new_count integer;
  new_sum numeric(10,2);
  target_spice_name text;
BEGIN
  -- Determine which spice_id to update
  IF TG_OP = 'DELETE' THEN
    target_spice_id := OLD.spice_id;
  ELSE
    target_spice_id := NEW.spice_id;
  END IF;

  -- Get spice name
  target_spice_name := get_spice_name(target_spice_id);

  -- Calculate new statistics
  SELECT 
    COALESCE(AVG(rating), 0)::numeric(4,2),
    COUNT(*)::integer,
    COALESCE(SUM(rating), 0)::numeric(10,2)
  INTO new_avg, new_count, new_sum
  FROM user_rankings 
  WHERE spice_id = target_spice_id;

  -- Update or insert community rating
  INSERT INTO community_ratings (spice_id, spice_name, average_rating, total_ratings, rating_sum, updated_at)
  VALUES (target_spice_id, target_spice_name, new_avg, new_count, new_sum, now())
  ON CONFLICT (spice_id) 
  DO UPDATE SET 
    spice_name = target_spice_name,
    average_rating = new_avg,
    total_ratings = new_count,
    rating_sum = new_sum,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop the temporary function
DROP FUNCTION get_spice_name(text);