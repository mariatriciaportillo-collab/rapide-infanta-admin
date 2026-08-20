-- 1. Create Inventory Movements Table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    part_id UUID REFERENCES public.parts(id) ON DELETE CASCADE NOT NULL,
    movement_type TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL, -- positive for IN, negative for OUT
    unit_cost NUMERIC(12,2) DEFAULT 0.00,
    reference_type TEXT,
    reference_id TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Trigger to automatically update stock_quantity in parts table
CREATE OR REPLACE FUNCTION update_part_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.parts SET stock_quantity = COALESCE(stock_quantity, 0) + NEW.quantity WHERE id = NEW.part_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.parts SET stock_quantity = COALESCE(stock_quantity, 0) - OLD.quantity WHERE id = OLD.part_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.parts SET stock_quantity = COALESCE(stock_quantity, 0) - OLD.quantity + NEW.quantity WHERE id = NEW.part_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS on_inventory_movement ON public.inventory_movements;

CREATE TRIGGER on_inventory_movement
AFTER INSERT OR UPDATE OR DELETE ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION update_part_stock_from_movement();

-- 3. Enable RLS
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Public read inventory_movements" ON public.inventory_movements FOR SELECT USING (true);
CREATE POLICY "Admin manage inventory_movements" ON public.inventory_movements FOR ALL USING (auth.role() = 'authenticated');
