import { supabase } from '../lib/supabase';
import { Spice, UserRanking } from '../types/spice';
import { spices } from '../data/spices';

// Generate or get session ID for anonymous users
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('anonymous_session_id', sessionId);
  }
  return sessionId;
};

export interface DatabaseRanking {
  id: string;
  user_id: string;
  spice_id: string;
  rating: number;
  ranked_at: string;
  updated_at: string;
}

export interface AnonymousRanking {
  id: string;
  session_id: string;
  spice_id: string;
  rating: number;
  ranked_at: string;
  updated_at: string;
}

export const rankingService = {
  // Load user's rankings from database
  async loadUserRankings(userId?: string): Promise<UserRanking[]> {
    try {
      if (userId) {
        // Load authenticated user rankings
        const { data, error } = await supabase
          .from('user_rankings')
          .select('*')
          .eq('user_id', userId)
          .order('rating', { ascending: false })
          .order('ranked_at', { ascending: true });

        if (error) {
          console.error('Error loading user rankings:', error);
          return [];
        }

        return this.convertUserRankingsToUserRanking(data || []);
      } else {
        // Load anonymous user rankings
        const sessionId = getSessionId();
        const { data, error } = await supabase
          .from('anonymous_rankings')
          .select('*')
          .eq('session_id', sessionId)
          .order('rating', { ascending: false })
          .order('ranked_at', { ascending: true });

        if (error) {
          console.error('Error loading anonymous rankings:', error);
          return [];
        }

        return this.convertAnonymousRankingsToUserRanking(data || []);
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
      return [];
    }
  },

  // Convert database user rankings to UserRanking format
  convertUserRankingsToUserRanking(dbRankings: DatabaseRanking[]): UserRanking[] {
    const userRankings: UserRanking[] = [];
    
    for (const dbRanking of dbRankings) {
      const spice = spices.find(s => s.id === dbRanking.spice_id);
      if (spice) {
        userRankings.push({
          spice,
          rating: dbRanking.rating,
          rankedAt: new Date(dbRanking.ranked_at)
        });
      }
    }

    return this.sortRankings(userRankings);
  },

  // Convert database anonymous rankings to UserRanking format
  convertAnonymousRankingsToUserRanking(dbRankings: AnonymousRanking[]): UserRanking[] {
    const userRankings: UserRanking[] = [];
    
    for (const dbRanking of dbRankings) {
      const spice = spices.find(s => s.id === dbRanking.spice_id);
      if (spice) {
        userRankings.push({
          spice,
          rating: dbRanking.rating,
          rankedAt: new Date(dbRanking.ranked_at)
        });
      }
    }

    return this.sortRankings(userRankings);
  },

  // Sort rankings by rating (descending) then by ranked_at (ascending) for tie-breaking
  sortRankings(rankings: UserRanking[]): UserRanking[] {
    return rankings.sort((a, b) => {
      if (Math.abs(a.rating - b.rating) < 0.05) {
        return a.rankedAt.getTime() - b.rankedAt.getTime();
      }
      return b.rating - a.rating;
    });
  },

  // Save or update a ranking
  async saveRanking(spice: Spice, rating: number, userId?: string): Promise<boolean> {
    try {
      console.log(`Saving ranking: ${spice.name} = ${rating}, userId: ${userId}`);
      if (userId) {
        // Save to user_rankings for authenticated users
        const { error } = await supabase
          .from('user_rankings')
          .upsert({
            user_id: userId,
            spice_id: spice.id,
            rating: rating,
            ranked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,spice_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error saving user ranking:', error);
          return false;
        }
        console.log('User ranking saved successfully');
      } else {
        // Save to anonymous_rankings for anonymous users
        const sessionId = getSessionId();
        console.log(`Saving anonymous ranking with session: ${sessionId}`);
        const { error } = await supabase
          .from('anonymous_rankings')
          .upsert({
            session_id: sessionId,
            spice_id: spice.id,
            rating: rating,
            ranked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'session_id,spice_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error saving anonymous ranking:', error);
          return false;
        }
        console.log('Anonymous ranking saved successfully');
      }

      return true;
    } catch (error) {
      console.error('Error saving ranking:', error);
      return false;
    }
  },

  // Delete a ranking
  async deleteRanking(spiceId: string, userId?: string): Promise<boolean> {
    try {
      if (userId) {
        // Delete from user_rankings for authenticated users
        const { error } = await supabase
          .from('user_rankings')
          .delete()
          .eq('spice_id', spiceId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error deleting user ranking:', error);
          return false;
        }
      } else {
        // Delete from anonymous_rankings for anonymous users
        const sessionId = getSessionId();
        const { error } = await supabase
          .from('anonymous_rankings')
          .delete()
          .eq('spice_id', spiceId)
          .eq('session_id', sessionId);

        if (error) {
          console.error('Error deleting anonymous ranking:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting ranking:', error);
      return false;
    }
  },

  // Get local rankings from localStorage
  getLocalRankings(): any[] {
    try {
      const stored = localStorage.getItem('spice_rankings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading local rankings:', error);
      return [];
    }
  },

  // Load rankings (from database if logged in, localStorage if not)
  async loadRankings(userId?: string): Promise<UserRanking[]> {
    return this.loadUserRankings(userId);
  }
};