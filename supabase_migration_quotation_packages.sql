-- Migration: Add Package support to Quotations

ALTER TABLE public.quotation_items 
ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS part_id UUID REFERENCES public.parts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS parent_item_id UUID REFERENCES public.quotation_items(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_category BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS part_category_id UUID REFERENCES public.part_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS resolved_part_id UUID REFERENCES public.parts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS internal_price_snapshot NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS internal_amount_snapshot NUMERIC(10, 2) DEFAULT 0;

-- Optionally, set existing items to 'MANUAL'
UPDATE public.quotation_items SET item_type = 'MANUAL' WHERE item_type IS NULL;

