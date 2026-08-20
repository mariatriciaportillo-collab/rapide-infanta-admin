-- Safe migration strategy to convert existing parts stock into OPENING_BALANCE inventory movements.
-- This prevents the "duplicate stock" issue while still giving everything an audit trail.

DO $$ 
DECLARE
    part_record RECORD;
BEGIN
    FOR part_record IN 
        SELECT id, stock_quantity, cost FROM public.parts 
        WHERE stock_quantity > 0 
        AND NOT EXISTS (SELECT 1 FROM public.inventory_movements WHERE part_id = parts.id)
    LOOP
        -- 1. Reset stock to 0 temporarily to prevent duplication when the trigger fires
        UPDATE public.parts SET stock_quantity = 0 WHERE id = part_record.id;
        
        -- 2. Insert opening balance (this will fire the 'on_inventory_movement' trigger and correctly add the stock back)
        INSERT INTO public.inventory_movements (part_id, movement_type, quantity, unit_cost, reference_type, notes)
        VALUES (
            part_record.id, 
            'OPENING_BALANCE', 
            part_record.stock_quantity, 
            COALESCE(part_record.cost, 0), 
            'Opening Balance', 
            'System generated opening balance from legacy stock'
        );
    END LOOP;
END $$;
