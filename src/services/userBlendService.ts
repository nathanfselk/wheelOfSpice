import { supabase } from '../lib/supabase';
import { BlendSpice, UserBlend } from '../types/blend';
import { rateLimitService } from './rateLimitService';

export class UserBlendService {
  /**
   * Save a user's custom blend
   */
  async saveBlend(
    userId: string,
    name: string,
    spices: BlendSpice[],
    flavorProfile: string[],
    commonUses: string[],
    similarBlends: string[]
  ): Promise<{ success: boolean; error?: string; blendId?: string }> {
    // Check rate limit
    const rateLimit = rateLimitService.checkRateLimit('ranking', userId);
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.message || 'Too many attempts. Please slow down.' };
    }

    try {
      // Record the attempt
      rateLimitService.recordAttempt('ranking', userId);

      // Validate inputs
      if (!name.trim() || name.trim().length < 2) {
        return { success: false, error: 'Blend name must be at least 2 characters long.' };
      }

      if (name.trim().length > 100) {
        return { success: false, error: 'Blend name must be less than 100 characters.' };
      }

      if (spices.length < 2 || spices.length > 5) {
        return { success: false, error: 'Blend must contain 2-5 spices.' };
      }

      const totalPercentage = spices.reduce((sum, spice) => sum + spice.percentage, 0);
      if (totalPercentage !== 100) {
        return { success: false, error: 'Spice percentages must add up to 100%.' };
      }

      const { data, error } = await supabase
        .from('user_blends')
        .insert({
          user_id: userId,
          name: name.trim(),
          spices: JSON.stringify(spices),
          flavor_profile: flavorProfile,
          common_uses: commonUses,
          similar_blends: similarBlends
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving blend:', error);
        return { success: false, error: 'Failed to save blend.' };
      }

      return { success: true, blendId: data.id };
    } catch (error) {
      console.error('Error saving blend:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }

  /**
   * Get all blends for a user
   */
  async getUserBlends(userId: string): Promise<UserBlend[]> {
    try {
      const { data, error } = await supabase
        .from('user_blends')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user blends:', error);
        return [];
      }

      // Parse the spices JSON and convert to UserBlend format
      return (data || []).map(blend => ({
        ...blend,
        spices: typeof blend.spices === 'string' ? JSON.parse(blend.spices) : blend.spices
      }));
    } catch (error) {
      console.error('Error loading user blends:', error);
      return [];
    }
  }

  /**
   * Delete a user's blend
   */
  async deleteBlend(userId: string, blendId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_blends')
        .delete()
        .eq('id', blendId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting blend:', error);
        return { success: false, error: 'Failed to delete blend.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting blend:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }

  /**
   * Update a user's blend
   */
  async updateBlend(
    userId: string,
    blendId: string,
    name: string,
    spices: BlendSpice[],
    flavorProfile: string[],
    commonUses: string[],
    similarBlends: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate inputs
      if (!name.trim() || name.trim().length < 2) {
        return { success: false, error: 'Blend name must be at least 2 characters long.' };
      }

      if (name.trim().length > 100) {
        return { success: false, error: 'Blend name must be less than 100 characters.' };
      }

      const { error } = await supabase
        .from('user_blends')
        .update({
          name: name.trim(),
          spices: JSON.stringify(spices),
          flavor_profile: flavorProfile,
          common_uses: commonUses,
          similar_blends: similarBlends,
          updated_at: new Date().toISOString()
        })
        .eq('id', blendId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating blend:', error);
        return { success: false, error: 'Failed to update blend.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating blend:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }
}

export const userBlendService = new UserBlendService();