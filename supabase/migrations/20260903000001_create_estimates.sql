-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    estimate_number text UNIQUE NOT NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
    customer_type text,
    customer_name text,
    contact_person text,
    customer_email text,
    customer_telephone text,
    customer_tin text,
    customer_address text,
    vehicle_plate text,
    vehicle_make text,
    vehicle_model text,
    vehicle_year integer,
    mileage_km numeric,
    status text DEFAULT 'draft',
    prepared_by text,
    service_advisor_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
    service_advisor_name text,
    mechanic_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
    mechanic_name text,
    notes text,
    subtotal numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    grand_total numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.estimates;
CREATE POLICY "Enable read for authenticated users" ON public.estimates FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.estimates;
CREATE POLICY "Enable insert for authenticated users" ON public.estimates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.estimates;
CREATE POLICY "Enable update for authenticated users" ON public.estimates FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.estimates;
CREATE POLICY "Enable delete for authenticated users" ON public.estimates FOR DELETE USING (auth.role() = 'authenticated');

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    estimate_id uuid REFERENCES public.estimates(id) ON DELETE CASCADE,
    sort_order integer,
    item_type text,
    package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
    labor_service_id uuid REFERENCES public.labor_services(id) ON DELETE SET NULL,
    part_id uuid REFERENCES public.parts(id) ON DELETE SET NULL,
    parent_item_id uuid REFERENCES public.estimate_items(id) ON DELETE CASCADE,
    is_section_header boolean DEFAULT false,
    is_category boolean DEFAULT false,
    description text,
    quantity numeric,
    unit_price numeric,
    total_price numeric,
    category_id uuid,
    group_name_snapshot text,
    category_name_snapshot text,
    standard_hour_snapshot numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.estimate_items;
CREATE POLICY "Enable read for authenticated users" ON public.estimate_items FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.estimate_items;
CREATE POLICY "Enable insert for authenticated users" ON public.estimate_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.estimate_items;
CREATE POLICY "Enable update for authenticated users" ON public.estimate_items FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.estimate_items;
CREATE POLICY "Enable delete for authenticated users" ON public.estimate_items FOR DELETE USING (auth.role() = 'authenticated');

NOTIFY pgrst, 'reload schema';
