-- Migration: Support Category-based Parts in Packages

ALTER TABLE public.package_items 
ADD COLUMN IF NOT EXISTS is_category BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS part_category_id UUID REFERENCES public.part_categories(id);

