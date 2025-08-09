/*
  # Create spices table and get_spice_name function

  1. New Tables
    - `spices`
      - `id` (text, primary key) - matches spice IDs from frontend
      - `name` (text, not null) - human readable spice names
      - `created_at` (timestamp) - when spice was added

  2. Data Population
    - Insert all spices from the frontend data

  3. Functions
    - `get_spice_name(spice_id_text)` - lookup function to get spice name by ID

  4. Security
    - Enable RLS on spices table
    - Allow public read access to spices data
*/

-- Create the spices table
CREATE TABLE IF NOT EXISTS public.spices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all spice data from src/data/spices.ts
INSERT INTO public.spices (id, name) VALUES 
('1', 'Cinnamon'),
('2', 'Black Pepper'),
('3', 'Turmeric'),
('4', 'Paprika'),
('5', 'Cumin'),
('6', 'Ginger'),
('7', 'Garlic Powder'),
('8', 'Oregano'),
('9', 'Thyme'),
('10', 'Rosemary'),
('11', 'Basil'),
('12', 'Chili Powder'),
('13', 'Cayenne Pepper'),
('14', 'Nutmeg'),
('15', 'Cloves'),
('16', 'Cardamom'),
('17', 'Coriander'),
('18', 'Fennel'),
('19', 'Bay Leaves'),
('20', 'Sage'),
('21', 'Parsley'),
('22', 'Dill'),
('23', 'Tarragon'),
('24', 'Marjoram'),
('25', 'Allspice')
ON CONFLICT (id) DO NOTHING;

-- Create the get_spice_name function
CREATE OR REPLACE FUNCTION public.get_spice_name(spice_id_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    spice_name_val TEXT;
BEGIN
    SELECT name INTO spice_name_val FROM public.spices WHERE id = spice_id_text;
    RETURN spice_name_val;
END;
$$;

-- Enable RLS on spices table
ALTER TABLE public.spices ENABLE ROW LEVEL SECURITY;

-- Allow public read access to spices data
CREATE POLICY "Public can read spices"
  ON public.spices
  FOR SELECT
  TO public
  USING (true);