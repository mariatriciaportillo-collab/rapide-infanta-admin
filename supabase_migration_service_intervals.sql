CREATE TABLE IF NOT EXISTS public.service_intervals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    service_type text NOT NULL,
    classification text,
    months integer DEFAULT 0,
    kilometers integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.service_intervals ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (assuming basic RLS for this admin table)
CREATE POLICY "Allow authenticated read" ON public.service_intervals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON public.service_intervals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.service_intervals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON public.service_intervals FOR DELETE TO authenticated USING (true);

-- Allow anonymous operations during dev (since this might be testing without strict auth)
CREATE POLICY "Allow anon read" ON public.service_intervals FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert" ON public.service_intervals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.service_intervals FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete" ON public.service_intervals FOR DELETE TO anon USING (true);

NOTIFY pgrst, 'reload schema';
