import { supabase } from '../lib/supabase';

export interface CommunityRating {
  spice_id: string;
  average_rating: number;
  total_ratings: number;
  rating_sum: number;
  updated_at: string;
}

export class CommunityRatingService {
  /**
   * Get community rating for a specific spice
   */
  async getCommunityRating(spiceId: string): Promise<CommunityRating | null> {
    try {
      const { data, error } = await supabase
        .from('community_ratings')
        .select('*')
        .eq('spice_id', spiceId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rating found for this spice yet
          return null;
        }
        console.error('Error getting community rating:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting community rating:', error);
      return null;
    }
  }

  /**
   * Get all community ratings
   */
  async getAllCommunityRatings(): Promise<CommunityRating[]> {
    try {
      const { data, error } = await supabase
        .from('community_ratings')
        .select('*')
        .order('average_rating', { ascending: false });

      if (error) {
        console.error('Error getting all community ratings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all community ratings:', error);
      return [];
    }
  }

  /**
   * Get community ratings for multiple spices
   */
  async getCommunityRatings(spiceIds: string[]): Promise<Record<string, CommunityRating>> {
    try {
      const { data, error } = await supabase
        .from('community_ratings')
        .select('*')
        .in('spice_id', spiceIds);

      if (error) {
        console.error('Error getting community ratings:', error);
        return {};
      }

      // Convert array to object keyed by spice_id
      const ratingsMap: Record<string, CommunityRating> = {};
      data?.forEach(rating => {
        ratingsMap[rating.spice_id] = rating;
      });

      return ratingsMap;
    } catch (error) {
      console.error('Error getting community ratings:', error);
      return {};
    }
  }

  /**
   * Get top-rated spices by community
   */
  async getTopRatedSpices(limit: number = 10): Promise<CommunityRating[]> {
    try {
      const { data, error } = await supabase
        .from('community_ratings')
        .select('*')
        .gte('total_ratings', 2) // Only include spices with at least 2 ratings
        .order('average_rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting top rated spices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting top rated spices:', error);
      return [];
    }
  }

  /**
   * Get spices with the most ratings
   */
  async getMostRatedSpices(limit: number = 10): Promise<CommunityRating[]> {
    try {
      const { data, error } = await supabase
        .from('community_ratings')
        .select('*')
        .order('total_ratings', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting most rated spices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting most rated spices:', error);
      return [];
    }
  }

  /**
   * Subscribe to community rating changes for real-time updates
   */
  subscribeToCommunityRatings(callback: (payload: any) => void) {
    return supabase
      .channel('community_ratings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_ratings'
        },
        callback
      )
      .subscribe();
  }
}

export const communityRatingService = new CommunityRatingService();