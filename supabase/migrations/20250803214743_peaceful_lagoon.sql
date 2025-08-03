/*
  # Create missing spice submissions table

  1. New Tables
    - `missing_spice_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `spice_name` (text, the requested spice name)
      - `status` (text, submission status: pending, approved, rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `missing_spice_submissions` table
    - Add policy for authenticated users to insert their own submissions
    - Add policy for authenticated users to read their own submissions
    - Add policy for service role to manage all submissions

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on status for admin filtering
    - Add index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS missing_spice_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  spice_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE missing_spice_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own submissions"
  ON missing_spice_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own submissions"
  ON missing_spice_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all submissions"
  ON missing_spice_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_missing_spice_submissions_user_id 
  ON missing_spice_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_missing_spice_submissions_status 
  ON missing_spice_submissions(status);

CREATE INDEX IF NOT EXISTS idx_missing_spice_submissions_created_at 
  ON missing_spice_submissions(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_missing_spice_submissions_updated_at'
  ) THEN
    CREATE TRIGGER update_missing_spice_submissions_updated_at
      BEFORE UPDATE ON missing_spice_submissions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;