/*
  # Complete Supabase Database Configuration
  
  This migration ensures all tables, functions, triggers, and policies are properly set up
  for the Wheel of Spice application.
  
  1. Tables
    - user_rankings: User spice rankings
    - community_ratings: Aggregated community ratings
    - user_blends: Custom spice blends
    - missing_spice_submissions: User requests for missing spices
    - stripe_customers: Stripe customer mappings
    - stripe_subscriptions: Subscription data
    - stripe_orders: Order history
  
  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Proper policies for authenticated and anonymous users
    
  3. Functions & Triggers
    - Community rating calculation triggers
    - Updated timestamp triggers
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_rankings table
CREATE TABLE IF NOT EXISTS user_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  spice_id text NOT NULL,
  rating numeric(3,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 10.0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, spice_id)
);

-- Create community_ratings table
CREATE TABLE IF NOT EXISTS community_ratings (
  spice_id text PRIMARY KEY,
  spice_name text,
  average_rating numeric(4,2) DEFAULT 0.00,
  total_ratings integer DEFAULT 0,
  rating_sum numeric(10,2) DEFAULT 0.00,
  updated_at timestamptz DEFAULT now()
);

-- Create user_blends table
CREATE TABLE IF NOT EXISTS user_blends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  spices jsonb NOT NULL,
  flavor_profile text[] DEFAULT '{}',
  common_uses text[] DEFAULT '{}',
  similar_blends text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create missing_spice_submissions table
CREATE TABLE IF NOT EXISTS missing_spice_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  spice_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Stripe tables
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create subscription status enum
DO $$ BEGIN
  CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text UNIQUE NOT NULL,
  subscription_id text DEFAULT NULL,
  price_id text DEFAULT NULL,
  current_period_start bigint DEFAULT NULL,
  current_period_end bigint DEFAULT NULL,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text DEFAULT NULL,
  payment_method_last4 text DEFAULT NULL,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Create order status enum
DO $$ BEGIN
  CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS stripe_orders (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status stripe_order_status NOT NULL DEFAULT 'pending',
  shipping_address jsonb,
  shipping_name text,
  shipping_phone text,
  shipping_cost bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- Enable RLS on all tables
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blends ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_spice_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rankings
DROP POLICY IF EXISTS "Users can read own rankings" ON user_rankings;
CREATE POLICY "Users can read own rankings"
  ON user_rankings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own rankings" ON user_rankings;
CREATE POLICY "Users can insert own rankings"
  ON user_rankings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rankings" ON user_rankings;
CREATE POLICY "Users can update own rankings"
  ON user_rankings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rankings" ON user_rankings;
CREATE POLICY "Users can delete own rankings"
  ON user_rankings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for community_ratings
DROP POLICY IF EXISTS "Public can read community ratings" ON community_ratings;
CREATE POLICY "Public can read community ratings"
  ON community_ratings FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Service role can manage community ratings" ON community_ratings;
CREATE POLICY "Service role can manage community ratings"
  ON community_ratings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_blends
DROP POLICY IF EXISTS "Users can read own blends" ON user_blends;
CREATE POLICY "Users can read own blends"
  ON user_blends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own blends" ON user_blends;
CREATE POLICY "Users can insert own blends"
  ON user_blends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own blends" ON user_blends;
CREATE POLICY "Users can update own blends"
  ON user_blends FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own blends" ON user_blends;
CREATE POLICY "Users can delete own blends"
  ON user_blends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for missing_spice_submissions
DROP POLICY IF EXISTS "Users can insert own submissions" ON missing_spice_submissions;
CREATE POLICY "Users can insert own submissions"
  ON missing_spice_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own submissions" ON missing_spice_submissions;
CREATE POLICY "Users can read own submissions"
  ON missing_spice_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all submissions" ON missing_spice_submissions;
CREATE POLICY "Service role can manage all submissions"
  ON missing_spice_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Stripe tables
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_rankings_updated_at ON user_rankings;
CREATE TRIGGER update_user_rankings_updated_at
  BEFORE UPDATE ON user_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_blends_updated_at ON user_blends;
CREATE TRIGGER update_user_blends_updated_at
  BEFORE UPDATE ON user_blends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missing_spice_submissions_updated_at ON missing_spice_submissions;
CREATE TRIGGER update_missing_spice_submissions_updated_at
  BEFORE UPDATE ON missing_spice_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Community rating calculation function
CREATE OR REPLACE FUNCTION refresh_community_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  target_spice_id TEXT;
BEGIN
  -- Determine which spice_id to update
  IF TG_OP = 'DELETE' THEN
    target_spice_id := OLD.spice_id;
  ELSE
    target_spice_id := NEW.spice_id;
  END IF;

  -- Recalculate community rating for the affected spice
  INSERT INTO community_ratings (spice_id, spice_name, average_rating, total_ratings, rating_sum, updated_at)
  SELECT 
    target_spice_id,
    target_spice_id as spice_name,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(*) as total_ratings,
    SUM(rating) as rating_sum,
    NOW() as updated_at
  FROM user_rankings 
  WHERE spice_id = target_spice_id
  ON CONFLICT (spice_id) 
  DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_ratings = EXCLUDED.total_ratings,
    rating_sum = EXCLUDED.rating_sum,
    updated_at = EXCLUDED.updated_at;

  -- If no ratings exist after DELETE, remove the community rating
  IF TG_OP = 'DELETE' AND NOT EXISTS (
    SELECT 1 FROM user_rankings WHERE spice_id = target_spice_id
  ) THEN
    DELETE FROM community_ratings WHERE spice_id = target_spice_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for community rating updates
DROP TRIGGER IF EXISTS trigger_refresh_community_rating ON user_rankings;
CREATE TRIGGER trigger_refresh_community_rating
  AFTER INSERT OR UPDATE OR DELETE ON user_rankings
  FOR EACH ROW EXECUTE FUNCTION refresh_community_rating();

-- Create views for Stripe data
DROP VIEW IF EXISTS stripe_user_subscriptions;
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
  c.customer_id,
  s.subscription_id,
  s.status as subscription_status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.payment_method_brand,
  s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

DROP VIEW IF EXISTS stripe_user_orders;
CREATE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date,
  so.shipping_address,
  so.shipping_name,
  so.shipping_phone,
  so.shipping_cost
FROM stripe_customers sc
JOIN stripe_orders so ON sc.customer_id = so.customer_id
WHERE sc.user_id = auth.uid() AND sc.deleted_at IS NULL AND so.deleted_at IS NULL;

-- Grant permissions on views
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_spice_id ON user_rankings(spice_id);
CREATE INDEX IF NOT EXISTS idx_user_blends_user_id ON user_blends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blends_created_at ON user_blends(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missing_spice_submissions_user_id ON missing_spice_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_missing_spice_submissions_status ON missing_spice_submissions(status);
CREATE INDEX IF NOT EXISTS idx_missing_spice_submissions_created_at ON missing_spice_submissions(created_at DESC);