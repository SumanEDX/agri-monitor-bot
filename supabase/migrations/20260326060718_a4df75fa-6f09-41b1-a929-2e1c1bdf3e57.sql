
-- Create farmers table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  crops TEXT[] NOT NULL DEFAULT '{}',
  plots INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plots table
CREATE TABLE public.plots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  crop TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  farmer TEXT NOT NULL DEFAULT '',
  health INTEGER NOT NULL DEFAULT 80,
  stage TEXT NOT NULL DEFAULT '',
  irrigation TEXT NOT NULL DEFAULT 'Drip',
  soil_moisture INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL DEFAULT '',
  due TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create water_sources table
CREATE TABLE public.water_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Borewell',
  location TEXT NOT NULL DEFAULT '',
  capacity_liters INTEGER NOT NULL DEFAULT 0,
  current_level_percent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  linked_plots INTEGER NOT NULL DEFAULT 0,
  last_checked DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sources ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow public read farmers" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Allow public insert farmers" ON public.farmers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update farmers" ON public.farmers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete farmers" ON public.farmers FOR DELETE USING (true);

CREATE POLICY "Allow public read plots" ON public.plots FOR SELECT USING (true);
CREATE POLICY "Allow public insert plots" ON public.plots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update plots" ON public.plots FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete plots" ON public.plots FOR DELETE USING (true);

CREATE POLICY "Allow public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON public.tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Allow public read water_sources" ON public.water_sources FOR SELECT USING (true);
CREATE POLICY "Allow public insert water_sources" ON public.water_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update water_sources" ON public.water_sources FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete water_sources" ON public.water_sources FOR DELETE USING (true);
