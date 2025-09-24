import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (error.message.includes('Failed to fetch')) {
            setError('Cannot connect to authentication service. Please check your internet connection and Supabase configuration.');
          } else {
            setError(error.message);
          }
        } else {
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error in getSession:', err);
        if (err.message && err.message.includes('Failed to fetch')) {
          setError('Cannot connect to authentication service. Please check your internet connection and Supabase configuration.');
        } else {
          setError(err.message || 'Failed to get session');
        }
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          setUser(session?.user ?? null);
          setError(null);
          
          // Handle specific auth events
          if (event === 'SIGNED_IN') {
            console.log('User signed in successfully');
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed');
          }
        } catch (err: any) {
          console.error('Error handling auth state change:', err);
          setError(err.message || 'Auth state change error');
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        setError(error.message);
        return { error: error.message };
      }
      
      setError(null);
      return { error: null };
    } catch (err: any) {
      console.error('Error in signOut:', err);
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isConfigured: isSupabaseConfigured()
  };
};