-- 1. Create the Employees Table Safely
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

-- 2. Add foreign keys safely ONLY to tables that actually exist
DO $$
BEGIN
    -- Check for Quotations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotations') THEN
        ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
    END IF;
    
    -- Check for Estimates
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estimates') THEN
        ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
    END IF;
    
    -- Note: Removed public.invoices entirely to prevent the 42P01 error.
END $$;

-- 3. Enable RLS and proper policies matching other working tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Authenticated manage employees" ON public.employees FOR ALL USING (auth.role() = 'authenticated');

-- 4. CRITICAL: Grant base permissions
GRANT ALL ON TABLE public.employees TO anon, authenticated, service_role;

-- 5. Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
