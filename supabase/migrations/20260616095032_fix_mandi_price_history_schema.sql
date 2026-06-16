-- Add missing columns to mandi_price_history table
ALTER TABLE mandi_price_history ADD COLUMN IF NOT EXISTS variety text NOT NULL DEFAULT '';
ALTER TABLE mandi_price_history ADD COLUMN IF NOT EXISTS arrival_date date;

-- Copy existing date values to arrival_date
UPDATE mandi_price_history SET arrival_date = date WHERE arrival_date IS NULL;

-- Make arrival_date NOT NULL after populating
ALTER TABLE mandi_price_history ALTER COLUMN arrival_date SET NOT NULL;

-- Add unique constraint for upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mandi_price_history_unique_row'
  ) THEN
    ALTER TABLE mandi_price_history 
    ADD CONSTRAINT mandi_price_history_unique_row UNIQUE (commodity, variety, market, arrival_date);
  END IF;
END $$;