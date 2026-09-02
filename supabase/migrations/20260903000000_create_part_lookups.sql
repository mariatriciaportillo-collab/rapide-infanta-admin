CREATE TABLE IF NOT EXISTS public.part_lookups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_make_id uuid REFERENCES public.vehicle_makes(id) ON DELETE CASCADE,
    vehicle_model_id uuid REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
    year_start integer NOT NULL,
    year_end integer NOT NULL,
    engine_capacity text,
    transmission text,
    category text NOT NULL,
    part_id uuid REFERENCES public.parts_materials(id) ON DELETE SET NULL,
    part_number text,
    brand text,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.part_lookups ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for all users" ON public.part_lookups FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.part_lookups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.part_lookups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.part_lookups FOR DELETE USING (auth.role() = 'authenticated');
