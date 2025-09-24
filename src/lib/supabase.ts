import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'

// Create a mock client if credentials are invalid to prevent fetch errors
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        resend: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        verifyOtp: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: [], error: null })
          }),
          in: () => Promise.resolve({ data: [], error: null }),
          gte: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            })
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
          })
        }),
        upsert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        update: () => ({
          eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
        })
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({ unsubscribe: () => {} })
        })
      })
    }

export type AuthUser = {
  id: string
  email: string
}