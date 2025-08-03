import { supabase } from '../lib/supabase';

export interface AuthUserAverage {
  spice_id: string;
  average_rating: number;
  total_ratings: number;
}

export const authUserAverageService = {
  // Get average rankings for all spices from authenticated users only
  async getAuthUserAverages(): Promise<{ [spiceId: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('spice_id, rating');

      if (error) {
        console.error('Error fetching auth user rankings:', error);
        return {};
      }

      if (!data || data.length === 0) {
        return {};
      }

      // Group ratings by spice_id and calculate averages
      const spiceRatings: { [spiceId: string]: number[] } = {};
      
      data.forEach(ranking => {
        if (!spiceRatings[ranking.spice_id]) {
          spiceRatings[ranking.spice_id] = [];
        }
        spiceRatings[ranking.spice_id].push(ranking.rating);
      });

      // Calculate averages
      const averages: { [spiceId: string]: number } = {};
      
      Object.keys(spiceRatings).forEach(spiceId => {
        const ratings = spiceRatings[spiceId];
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        const average = sum / ratings.length;
        averages[spiceId] = Math.round(average * 10) / 10; // Round to 1 decimal place
      });

      return averages;
    } catch (error) {
      console.error('Error calculating auth user averages:', error);
      return {};
    }
  },

  // Get average ranking for a specific spice from authenticated users
  async getSpiceAuthUserAverage(spiceId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('rating')
        .eq('spice_id', spiceId);

      if (error) {
        console.error('Error fetching spice auth user rankings:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const sum = data.reduce((acc, ranking) => acc + ranking.rating, 0);
      const average = sum / data.length;
      
      return Math.round(average * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error calculating spice auth user average:', error);
      return 0;
    }
  },

  // Get detailed statistics for authenticated user rankings
  async getAuthUserStatistics(): Promise<AuthUserAverage[]> {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('spice_id, rating');

      if (error) {
        console.error('Error fetching auth user rankings for statistics:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group ratings by spice_id
      const spiceRatings: { [spiceId: string]: number[] } = {};
      
      data.forEach(ranking => {
        if (!spiceRatings[ranking.spice_id]) {
          spiceRatings[ranking.spice_id] = [];
        }
        spiceRatings[ranking.spice_id].push(ranking.rating);
      });

      // Calculate statistics for each spice
      const statistics: AuthUserAverage[] = [];
      
      Object.keys(spiceRatings).forEach(spiceId => {
        const ratings = spiceRatings[spiceId];
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        const average = sum / ratings.length;
        
        statistics.push({
          spice_id: spiceId,
          average_rating: Math.round(average * 10) / 10,
          total_ratings: ratings.length
        });
      });

      return statistics.sort((a, b) => b.average_rating - a.average_rating);
    } catch (error) {
      console.error('Error calculating auth user statistics:', error);
      return [];
    }
  }
};