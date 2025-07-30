import { spices as staticSpices } from '../data/spices';
import { Spice } from '../types/spice';
import { supabase } from '../lib/supabase';

export const spiceService = {
  // Get spices with community averages from the community_ratings table
  async getSpicesWithCommunityAverages(): Promise<Spice[]> {
    try {
      console.log('Fetching community ratings...');
      // Get community ratings from the dedicated table
      const { data: communityRatings, error } = await supabase
        .from('community_ratings')
        .select('spice_id, community_rating');

      if (error) {
        console.error('Error fetching community ratings:', error);
        return staticSpices;
      }

      console.log('Community ratings from DB:', communityRatings);

      // Create a map of spice_id to community_rating
      const ratingsMap: { [spiceId: string]: number } = {};
      (communityRatings || []).forEach(rating => {
        ratingsMap[rating.spice_id] = rating.community_rating;
      });

      console.log('Ratings map:', ratingsMap);

      // Update spices with community averages
      return staticSpices.map(spice => {
        const communityRating = ratingsMap[spice.id];
        
        console.log(`Spice ${spice.name} (${spice.id}): static=${spice.averageRating}, community=${communityRating}`);

        return {
          ...spice,
          averageRating: communityRating !== undefined && communityRating !== null ? communityRating : spice.averageRating
        };
      });
    } catch (error) {
      console.error('Error loading community averages:', error);
      return staticSpices;
    }
  },

  // Get spices without community averages (for backwards compatibility)
  async getSpices(): Promise<Spice[]> {
    return staticSpices;
  },

  // Initialize community ratings table with all spices
  async initializeCommunityRatings(): Promise<void> {
    try {
      // Get existing community ratings
      const { data: existingRatings } = await supabase
        .from('community_ratings')
        .select('spice_id');

      const existingSpiceIds = new Set((existingRatings || []).map(r => r.spice_id));

      // Find spices that don't have community rating records yet
      const missingSpices = staticSpices.filter(spice => !existingSpiceIds.has(spice.id));

      if (missingSpices.length > 0) {
        // Insert missing spices with default values
        const { error } = await supabase
          .from('community_ratings')
          .insert(
            missingSpices.map(spice => ({
              spice_id: spice.id,
              spice_name: spice.name,
              community_rating: spice.averageRating,
              auth_rating: 0,
              anon_rating: 0,
              total_rates: 0,
              auth_rates: 0,
              anon_rates: 0
            }))
          );

        if (error) {
          console.error('Error initializing community ratings:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing community ratings:', error);
    }
  }
};