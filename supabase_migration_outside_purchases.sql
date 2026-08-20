-- 1. Sequences for Outside Purchase
CREATE SEQUENCE IF NOT EXISTS outside_purchase_seq START 1;

-- 2. Outside Purchases Header Table
CREATE TABLE IF NOT EXISTS public.outside_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES public.suppliers(id),
    purchase_date DATE NOT NULL,
    receipt_number TEXT,
    total_amount NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Outside Purchase Items Table
CREATE TABLE IF NOT EXISTS public.outside_purchase_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outside_purchase_id UUID REFERENCES public.outside_purchases(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts(id),
    quantity NUMERIC(12,2) NOT NULL,
    unit_cost NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    inventory_treatment TEXT NOT NULL -- 'ADD_TO_INVENTORY' or 'DIRECT_USE'
);

-- 4. Enable RLS
ALTER TABLE public.outside_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outside_purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read outside_purchases" ON public.outside_purchases FOR SELECT USING (true);
CREATE POLICY "Admin manage outside_purchases" ON public.outside_purchases FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read outside_purchase_items" ON public.outside_purchase_items FOR SELECT USING (true);
CREATE POLICY "Admin manage outside_purchase_items" ON public.outside_purchase_items FOR ALL USING (auth.role() = 'authenticated');

-- 5. RPC for Atomic Outside Purchase
CREATE OR REPLACE FUNCTION process_outside_purchase(
    p_supplier_id UUID,
    p_purchase_date DATE,
    p_receipt_number TEXT,
    p_notes TEXT,
    p_items JSONB,
    p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_tx_id UUID;
    v_ref_no TEXT;
    v_item RECORD;
    v_total NUMERIC := 0;
BEGIN
    -- Generate Reference Number
    v_ref_no := 'OP-' || lpad(nextval('outside_purchase_seq')::text, 5, '0');

    -- Calculate total from items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(qty NUMERIC, unit_cost NUMERIC)
    LOOP
        v_total := v_total + (v_item.qty * v_item.unit_cost);
    END LOOP;

    -- Insert Header
    INSERT INTO public.outside_purchases (reference_number, supplier_id, purchase_date, receipt_number, total_amount, notes, created_by)
    VALUES (v_ref_no, p_supplier_id, p_purchase_date, p_receipt_number, v_total, p_notes, p_user_id)
    RETURNING id INTO v_tx_id;

    -- Process Each Item
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(part_id UUID, qty NUMERIC, unit_cost NUMERIC, total_amount NUMERIC, inventory_treatment TEXT)
    LOOP
        INSERT INTO public.outside_purchase_items (outside_purchase_id, part_id, quantity, unit_cost, total_amount, inventory_treatment)
        VALUES (v_tx_id, v_item.part_id, v_item.qty, v_item.unit_cost, v_item.total_amount, v_item.inventory_treatment);

        -- Create movement only if ADD_TO_INVENTORY
        IF v_item.inventory_treatment = 'ADD_TO_INVENTORY' THEN
            INSERT INTO public.inventory_movements (part_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
            VALUES (v_item.part_id, 'DIRECT_PURCHASE_RECEIPT', v_item.qty, v_item.unit_cost, 'Outside Purchase', v_ref_no, p_notes, p_user_id);
        END IF;
    END LOOP;

    RETURN v_ref_no;
END;
$$ LANGUAGE plpgsql;
