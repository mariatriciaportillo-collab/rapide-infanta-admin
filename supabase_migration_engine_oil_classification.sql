ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS engine_oil_classification TEXT;
NOTIFY pgrst, 'reload schema';
