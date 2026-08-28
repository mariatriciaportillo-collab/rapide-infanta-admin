DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotations') THEN
        ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS mechanic_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
        ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS service_advisor_name TEXT;
        ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS mechanic_name TEXT;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estimates') THEN
        ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS mechanic_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
        ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS service_advisor_name TEXT;
        ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS mechanic_name TEXT;
    END IF;
END $$;
NOTIFY pgrst, 'reload schema';
