-- Make 'date' column nullable since edge function only provides arrival_date
ALTER TABLE mandi_price_history ALTER COLUMN date DROP NOT NULL;

-- Add trigger to auto-populate date from arrival_date
CREATE OR REPLACE FUNCTION sync_mandi_dates()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date := NEW.arrival_date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mandi_date_sync ON mandi_price_history;
CREATE TRIGGER mandi_date_sync
  BEFORE INSERT ON mandi_price_history
  FOR EACH ROW EXECUTE FUNCTION sync_mandi_dates();