import { supabase } from '../lib/supabase';
import { MissingSpiceSubmission } from '../types/spice';
import { rateLimitService } from './rateLimitService';

export class MissingSpiceService {
  /**
   * Submit a missing spice request
   */
  async submitMissingSpice(userId: string, spiceName: string): Promise<{ success: boolean; error?: string }> {
    // Check rate limit for submissions
    const rateLimit = rateLimitService.checkRateLimit('missingSpice', userId);
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.message || 'Too many submissions. Please slow down.' };
    }

    try {
      // Record the attempt
      rateLimitService.recordAttempt('missingSpice', userId);

      // Clean and validate spice name
      const cleanSpiceName = spiceName.trim();
      if (!cleanSpiceName || cleanSpiceName.length < 2) {
        return { success: false, error: 'Spice name must be at least 2 characters long.' };
      }

      if (cleanSpiceName.length > 100) {
        return { success: false, error: 'Spice name must be less than 100 characters.' };
      }

      // Check if user already submitted this spice
      const { data: existingSubmission, error: checkError } = await supabase
        .from('missing_spice_submissions')
        .select('id')
        .eq('user_id', userId)
        .ilike('spice_name', cleanSpiceName)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing submission:', checkError);
        return { success: false, error: 'Failed to check existing submissions.' };
      }

      if (existingSubmission) {
        return { success: false, error: 'You have already submitted this spice.' };
      }

      // Submit the missing spice
      const { error } = await supabase
        .from('missing_spice_submissions')
        .insert({
          user_id: userId,
          spice_name: cleanSpiceName,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting missing spice:', error);
        return { success: false, error: 'Failed to submit spice request.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting missing spice:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }

  /**
   * Get user's missing spice submissions
   */
  async getUserSubmissions(userId: string): Promise<MissingSpiceSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('missing_spice_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user submissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user submissions:', error);
      return [];
    }
  }

  /**
   * Get all pending submissions (admin function)
   */
  async getPendingSubmissions(): Promise<MissingSpiceSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('missing_spice_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting pending submissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting pending submissions:', error);
      return [];
    }
  }
}

export const missingSpiceService = new MissingSpiceService();