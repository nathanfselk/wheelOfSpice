import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Configuration Check:')
console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')
console.log('Full URL:', supabaseUrl)
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0)

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co')

console.log('Has Valid Credentials:', hasValidCredentials)

// Test network connectivity to Supabase
if (hasValidCredentials) {
  fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'HEAD',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }).then(response => {
    console.log('Supabase connectivity test:', response.status === 200 ? 'SUCCESS' : `FAILED (${response.status})`)
  }).catch(error => {
    console.error('Supabase connectivity test FAILED:', error.message)
    console.error('This usually means:')
    console.error('1. Invalid Supabase URL or API key')
    console.error('2. Network/firewall blocking the connection')
    console.error('3. Supabase project is paused or deleted')
  })
}

// Create a mock client if credentials are invalid to prevent fetch errors
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: true
      }
    })
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

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => hasValidCredentials

// Helper function to get connection status
export const getSupabaseStatus = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { status: 'missing_env', message: 'Missing environment variables. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY' }
  }
  
  if (supabaseUrl === 'https://your-project-ref.supabase.co' || supabaseAnonKey === 'your-anon-key-here') {
    return { status: 'placeholder', message: 'Using placeholder credentials. Please update your .env file with real Supabase credentials' }
  }
  
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    return { status: 'invalid_url', message: 'Invalid Supabase URL format. Should be https://your-project-ref.supabase.co' }
  }
  
  return { status: 'configured', message: 'Supabase properly configured' }
}

export type AuthUser = {
  id: string
  email: string
}