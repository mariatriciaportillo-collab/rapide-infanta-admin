ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS display_name TEXT;
UPDATE public.parts SET display_name = name WHERE display_name IS NULL;
