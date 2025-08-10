/*
  # Add shipping information to orders

  1. Schema Changes
    - Add shipping_address (jsonb) to store complete address
    - Add shipping_name (text) for recipient name
    - Add shipping_phone (text) for contact number
    - Add shipping_cost (bigint) for shipping amount in cents

  2. Security
    - Maintain existing RLS policies
    - No additional security changes needed
*/

-- Add shipping columns to stripe_orders table
DO $$
BEGIN
  -- Add shipping_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN shipping_address jsonb;
  END IF;

  -- Add shipping_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'shipping_name'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN shipping_name text;
  END IF;

  -- Add shipping_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'shipping_phone'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN shipping_phone text;
  END IF;

  -- Add shipping_cost column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN shipping_cost bigint DEFAULT 0;
  END IF;
END $$;

-- Update the stripe_user_orders view to include shipping information
DROP VIEW IF EXISTS stripe_user_orders;

CREATE VIEW stripe_user_orders
WITH (security_invoker = true) AS
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