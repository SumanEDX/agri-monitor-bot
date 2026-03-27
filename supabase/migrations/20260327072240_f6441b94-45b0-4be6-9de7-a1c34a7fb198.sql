ALTER TABLE public.plots ADD COLUMN latitude double precision DEFAULT NULL;
ALTER TABLE public.plots ADD COLUMN longitude double precision DEFAULT NULL;
ALTER TABLE public.water_sources ADD COLUMN latitude double precision DEFAULT NULL;
ALTER TABLE public.water_sources ADD COLUMN longitude double precision DEFAULT NULL;