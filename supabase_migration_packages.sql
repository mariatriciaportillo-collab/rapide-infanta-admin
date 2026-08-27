-- Migration: Packages and Package Items

CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_code TEXT,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    package_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.package_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('LABOR', 'PART')),
    labor_charge_id UUID REFERENCES public.labor_charges(id),
    part_id UUID REFERENCES public.parts(id),
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;

-- Policies for Packages
CREATE POLICY "Enable read access for all users" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.packages FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.packages FOR DELETE USING (true);

-- Policies for Package Items
CREATE POLICY "Enable read access for all users" ON public.package_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.package_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.package_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.package_items FOR DELETE USING (true);

-- Setup Updated At Trigger for Packages
CREATE OR REPLACE FUNCTION update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_packages_updated_at ON public.packages;
CREATE TRIGGER trigger_update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION update_packages_updated_at();

