import { supabase } from '../lib/supabase';
import { Spice, UserRanking } from '../types/spice';

export class UserRankingService {
  /**
   * Load all rankings for the authenticated user
   */
  async loadUserRankings(userId: string): Promise<UserRanking[]> {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .eq('user_id', userId)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading user rankings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading user rankings:', error);
      return [];
    }
  }

  /**
   * Save or update a user's ranking for a spice
   */
  async saveRanking(userId: string, spiceId: string, rating: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_rankings')
        .upsert({
          user_id: userId,
          spice_id: spiceId,
          rating: rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,spice_id'
        });

      if (error) {
        console.error('Error saving ranking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving ranking:', error);
      return false;
    }
  }

  /**
   * Delete a user's ranking for a spice
   */
  async deleteRanking(userId: string, spiceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_rankings')
        .delete()
        .eq('user_id', userId)
        .eq('spice_id', spiceId);

      if (error) {
        console.error('Error deleting ranking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting ranking:', error);
      return false;
    }
  }

  /**
   * Get a specific ranking for a user and spice
   */
  async getRanking(userId: string, spiceId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('rating')
        .eq('user_id', userId)
        .eq('spice_id', spiceId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - ranking doesn't exist
          return null;
        }
        console.error('Error getting ranking:', error);
        return null;
      }

      return data?.rating || null;
    } catch (error) {
      console.error('Error getting ranking:', error);
      return null;
    }
  }
}

export const userRankingService = new UserRankingService();