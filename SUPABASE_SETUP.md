# Supabase Database Configuration Guide

## Overview
This guide will help you set up the complete Supabase database for the Wheel of Spice application.

## Prerequisites
1. A Supabase account (https://supabase.com)
2. A new Supabase project created
3. Your project's URL and anon key

## Step 1: Environment Variables
Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase project URL and anon key from your Supabase dashboard.

## Step 2: Database Setup

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250127000000_initialize_complete_schema.sql`
4. Run the SQL script

### Option B: Using Supabase CLI (Advanced)
If you have the Supabase CLI installed:
```bash
supabase db reset
```

## Step 3: Authentication Configuration

### Email Settings
1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your email templates (optional)
3. Set up email confirmation if desired
4. Configure redirect URLs for your domain

### Security Settings
1. Go to Authentication > Settings
2. Enable Row Level Security (RLS) - this should already be enabled by the migration
3. Review and adjust rate limiting settings if needed

## Step 4: Edge Functions (Optional)
If you plan to use Stripe integration:

1. Go to Edge Functions in your Supabase dashboard
2. The following functions should be deployed:
   - `stripe-checkout`: Handles Stripe checkout sessions
   - `stripe-webhook`: Handles Stripe webhooks

## Step 5: Verify Setup

### Check Tables
Verify these tables exist in your database:
- `user_rankings`
- `community_ratings`
- `user_blends`
- `missing_spice_submissions`
- `stripe_customers`
- `stripe_subscriptions`
- `stripe_orders`

### Check RLS Policies
Ensure Row Level Security is enabled and policies are active for all tables.

### Test Authentication
1. Start your development server: `npm run dev`
2. Try to sign up with a test email
3. Check if the user appears in the Authentication section of your Supabase dashboard

## Step 6: Stripe Integration (Optional)

If you want to enable purchasing features:

1. Set up a Stripe account
2. Add Stripe environment variables to your Supabase project
3. Configure webhook endpoints
4. Update the feature flags in `src/config/features.ts`

## Troubleshooting

### Common Issues

1. **"Supabase not configured" error**
   - Check your environment variables
   - Ensure the URL format is correct
   - Verify the anon key is valid

2. **Authentication not working**
   - Check if RLS policies are properly set up
   - Verify email confirmation settings
   - Check browser console for detailed errors

3. **Database connection issues**
   - Verify your project is not paused
   - Check if you've exceeded free tier limits
   - Ensure your IP is not blocked

### Getting Help

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for detailed error messages
3. Check the Supabase dashboard logs
4. Verify all migration files have been applied correctly

## Database Schema Overview

### Core Tables
- **user_rankings**: Stores individual user spice ratings
- **community_ratings**: Aggregated ratings across all users
- **user_blends**: Custom spice blends created by users
- **missing_spice_submissions**: User requests for missing spices

### E-commerce Tables (Optional)
- **stripe_customers**: Links Supabase users to Stripe customers
- **stripe_subscriptions**: Subscription management
- **stripe_orders**: Order history and tracking

### Security Features
- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Rate limiting for sensitive operations
- Secure authentication flow with PKCE

## Next Steps

After completing the database setup:
1. Test user registration and login
2. Try ranking some spices
3. Create a custom blend
4. Verify community ratings are updating
5. Test the shopping cart (if Stripe is configured)

Your Supabase database is now fully configured and ready for the Wheel of Spice application!