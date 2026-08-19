-- 1. Create Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Part Groups Table
CREATE TABLE IF NOT EXISTS public.part_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Part Categories Table
CREATE TABLE IF NOT EXISTS public.part_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.part_groups(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, name)
);

-- 4. Create Parts Table
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    part_number TEXT,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    group_id UUID REFERENCES public.part_groups(id) ON DELETE RESTRICT NOT NULL,
    category_id UUID REFERENCES public.part_categories(id) ON DELETE RESTRICT NOT NULL,
    unit TEXT,
    cost NUMERIC(12,2) DEFAULT 0.00,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    stock_quantity NUMERIC(12,2) DEFAULT 0,
    reorder_level NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- Brands
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin manage brands" ON public.brands FOR ALL USING (auth.role() = 'authenticated');

-- Part Groups
CREATE POLICY "Public read part_groups" ON public.part_groups FOR SELECT USING (true);
CREATE POLICY "Admin manage part_groups" ON public.part_groups FOR ALL USING (auth.role() = 'authenticated');

-- Part Categories
CREATE POLICY "Public read part_categories" ON public.part_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage part_categories" ON public.part_categories FOR ALL USING (auth.role() = 'authenticated');

-- Parts
CREATE POLICY "Public read parts" ON public.parts FOR SELECT USING (true);
CREATE POLICY "Admin manage parts" ON public.parts FOR ALL USING (auth.role() = 'authenticated');

