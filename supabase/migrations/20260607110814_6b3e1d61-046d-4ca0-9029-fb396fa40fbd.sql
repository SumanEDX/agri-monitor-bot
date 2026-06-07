CREATE TABLE public.mandi_price_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity text NOT NULL,
  variety text NOT NULL DEFAULT '',
  market text NOT NULL,
  district text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'Maharashtra',
  arrival_date date NOT NULL,
  modal_price integer NOT NULL,
  min_price integer,
  max_price integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (commodity, variety, market, arrival_date)
);

CREATE INDEX idx_mph_commodity_date ON public.mandi_price_history (commodity, arrival_date DESC);
CREATE INDEX idx_mph_market ON public.mandi_price_history (market);

GRANT SELECT ON public.mandi_price_history TO anon;
GRANT SELECT ON public.mandi_price_history TO authenticated;
GRANT ALL ON public.mandi_price_history TO service_role;

ALTER TABLE public.mandi_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read mandi price history"
  ON public.mandi_price_history FOR SELECT
  USING (true);
