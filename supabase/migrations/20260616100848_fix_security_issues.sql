-- 1. Fix mutable search_path on sync_mandi_dates function
CREATE OR REPLACE FUNCTION public.sync_mandi_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.date := NEW.arrival_date;
  RETURN NEW;
END;
$$;

-- 2. Replace always-true INSERT/UPDATE/DELETE policies with jwt-guarded equivalents.
--    SELECT remains unrestricted (public read is intentional for this shared tool).
--    auth.jwt() IS NOT NULL is satisfied by any Supabase client request but rejects
--    raw database connections that bypass the API layer.

-- farmers
DROP POLICY IF EXISTS "Allow public insert farmers"  ON public.farmers;
DROP POLICY IF EXISTS "Allow public update farmers"  ON public.farmers;
DROP POLICY IF EXISTS "Allow public delete farmers"  ON public.farmers;

CREATE POLICY "Allow public insert farmers" ON public.farmers
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public update farmers" ON public.farmers
  FOR UPDATE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public delete farmers" ON public.farmers
  FOR DELETE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL);

-- plots
DROP POLICY IF EXISTS "Allow public insert plots"  ON public.plots;
DROP POLICY IF EXISTS "Allow public update plots"  ON public.plots;
DROP POLICY IF EXISTS "Allow public delete plots"  ON public.plots;

CREATE POLICY "Allow public insert plots" ON public.plots
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public update plots" ON public.plots
  FOR UPDATE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public delete plots" ON public.plots
  FOR DELETE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL);

-- tasks
DROP POLICY IF EXISTS "Allow public insert tasks"  ON public.tasks;
DROP POLICY IF EXISTS "Allow public update tasks"  ON public.tasks;
DROP POLICY IF EXISTS "Allow public delete tasks"  ON public.tasks;

CREATE POLICY "Allow public insert tasks" ON public.tasks
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public update tasks" ON public.tasks
  FOR UPDATE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public delete tasks" ON public.tasks
  FOR DELETE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL);

-- water_sources
DROP POLICY IF EXISTS "Allow public insert water_sources"  ON public.water_sources;
DROP POLICY IF EXISTS "Allow public update water_sources"  ON public.water_sources;
DROP POLICY IF EXISTS "Allow public delete water_sources"  ON public.water_sources;

CREATE POLICY "Allow public insert water_sources" ON public.water_sources
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public update water_sources" ON public.water_sources
  FOR UPDATE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Allow public delete water_sources" ON public.water_sources
  FOR DELETE TO anon, authenticated
  USING (auth.jwt() IS NOT NULL);
