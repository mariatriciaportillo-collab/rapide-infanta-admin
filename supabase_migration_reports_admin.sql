-- Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    branch TEXT,
    mobile TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Intervals Settings
CREATE TABLE IF NOT EXISTS public.service_intervals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type TEXT NOT NULL, -- e.g., 'Oil Change', 'PMS'
    classification TEXT NOT NULL, -- e.g., 'Regular / Mineral', 'Semi Synthetic', 'Fully Synthetic'
    months INT NOT NULL,
    kilometers INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_type, classification)
);

-- Default Service Intervals
INSERT INTO public.service_intervals (service_type, classification, months, kilometers) VALUES
('Oil Change', 'Regular / Mineral', 3, 5000),
('Oil Change', 'Semi Synthetic', 6, 7000),
('Oil Change', 'Fully Synthetic', 6, 10000)
ON CONFLICT (service_type, classification) DO NOTHING;

-- Service History
CREATE TABLE IF NOT EXISTS public.service_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    service_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    mileage INT,
    service_name TEXT,
    oil_type TEXT,
    parts_used JSONB,
    next_due_date DATE,
    next_due_mileage INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alter existing tables to ensure we have the new fields
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS vin text,
ADD COLUMN IF NOT EXISTS engine_capacity text;

ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- GRANT PERMISSIONS (CRITICAL FIX FOR SCHEMA CACHE ERROR)
GRANT ALL ON TABLE public.employees TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.service_intervals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.service_history TO anon, authenticated, service_role;

-- Force Schema Cache reload for PostgREST API
NOTIFY pgrst, 'reload schema';
