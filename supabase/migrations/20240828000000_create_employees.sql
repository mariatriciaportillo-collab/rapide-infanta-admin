-- 1. Create the Employees Table
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

-- 2. Add foreign keys to Quotations and Invoices
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- 3. CRITICAL: Grant permissions so the API can see and write to the table
GRANT ALL ON TABLE public.employees TO anon, authenticated, service_role;

-- 4. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
