/*
  # Create mandi price history table

  1. New Tables
    - `mandi_price_history`
      - `id` (uuid, primary key)
      - `date` (date)
      - `commodity` (text)
      - `market` (text)
      - `state` (text)
      - `district` (text)
      - `min_price` (integer, in rupees)
      - `max_price` (integer, in rupees)
      - `modal_price` (integer, in rupees)
      - `arrival_quantity` (integer, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Indexes
    - Composite index on (market, date) for price queries
    - Composite index on (commodity, date) for commodity trends
    - Index on market for market searches
    - Index on commodity for commodity searches

  3. Security
    - Enable RLS on `mandi_price_history` table
    - Add policy for authenticated users to read all data
    - Add policy for service role to insert/update data
*/

CREATE TABLE IF NOT EXISTS mandi_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  commodity text NOT NULL,
  market text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  min_price integer NOT NULL DEFAULT 0,
  max_price integer NOT NULL DEFAULT 0,
  modal_price integer NOT NULL DEFAULT 0,
  arrival_quantity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mandi_market_date ON mandi_price_history(market, date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_commodity_date ON mandi_price_history(commodity, date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_market ON mandi_price_history(market);
CREATE INDEX IF NOT EXISTS idx_mandi_commodity ON mandi_price_history(commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_date ON mandi_price_history(date DESC);

ALTER TABLE mandi_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to mandi prices"
  ON mandi_price_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to insert mandi prices"
  ON mandi_price_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update mandi prices"
  ON mandi_price_history
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
