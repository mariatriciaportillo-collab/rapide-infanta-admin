ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS vin text,
ADD COLUMN IF NOT EXISTS engine_capacity text;
