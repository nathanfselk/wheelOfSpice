import { supabase } from '../lib/supabase';

export class EmailVerificationService {
  /**
   * Send verification email to user
   */
  async sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at != null;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  }

  /**
   * Get current user's email verification status
   */
  async getVerificationStatus(): Promise<{
    isVerified: boolean;
    email?: string;
    needsVerification: boolean;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { isVerified: false, needsVerification: false };
      }

      const isVerified = user.email_confirmed_at != null;
      
      return {
        isVerified,
        email: user.email,
        needsVerification: !isVerified
      };
    } catch (error) {
      console.error('Error getting verification status:', error);
      return { isVerified: false, needsVerification: false };
    }
  }

  /**
   * Handle email verification from URL parameters
   */
  async handleEmailVerification(): Promise<{ success: boolean; error?: string }> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const type = urlParams.get('type');

      if (type === 'signup' && token) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      }

      return { success: false, error: 'Invalid verification link' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();