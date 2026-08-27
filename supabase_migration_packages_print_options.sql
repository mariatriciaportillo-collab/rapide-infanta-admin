-- Migration: Add Printout Options to Packages

ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS hide_labor BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_parts BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS display_package_code BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_amounts BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS replacement_text TEXT;

