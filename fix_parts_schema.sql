-- 1. Add the missing auto_suggest_labor column
ALTER TABLE parts ADD COLUMN IF NOT EXISTS auto_suggest_labor BOOLEAN DEFAULT FALSE;

-- 2. Force Supabase / PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
