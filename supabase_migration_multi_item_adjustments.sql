-- 1. Sequences for generating reference numbers
CREATE SEQUENCE IF NOT EXISTS stock_adj_seq START 1;
CREATE SEQUENCE IF NOT EXISTS stock_swap_seq START 1;

-- 2. Header Table for Inventory Transactions
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'ADJUSTMENT', 'SWAP', 'DIRECT_PURCHASE'
    reference_number TEXT NOT NULL UNIQUE,
    reason TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add transaction_id to inventory_movements
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES public.inventory_transactions(id) ON DELETE CASCADE;

-- 4. Enable RLS for transactions
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read inventory_transactions" ON public.inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Admin manage inventory_transactions" ON public.inventory_transactions FOR ALL USING (auth.role() = 'authenticated');

-- 5. RPC for Atomic Stock Adjustment
CREATE OR REPLACE FUNCTION process_stock_adjustment(
    p_reason TEXT,
    p_notes TEXT,
    p_items JSONB,
    p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_tx_id UUID;
    v_ref_no TEXT;
    v_item RECORD;
    v_part_stock NUMERIC;
BEGIN
    -- Generate Reference Number
    v_ref_no := 'SA-' || lpad(nextval('stock_adj_seq')::text, 5, '0');

    -- Insert Header
    INSERT INTO public.inventory_transactions (type, reference_number, reason, notes, created_by)
    VALUES ('ADJUSTMENT', v_ref_no, p_reason, p_notes, p_user_id)
    RETURNING id INTO v_tx_id;

    -- Process Each Item
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(part_id UUID, adj_type TEXT, qty NUMERIC, unit_cost NUMERIC)
    LOOP
        -- Check Current Stock to prevent negative
        SELECT stock_quantity INTO v_part_stock FROM public.parts WHERE id = v_item.part_id FOR UPDATE;
        
        IF v_item.adj_type = 'Decrease Stock' AND v_part_stock < v_item.qty THEN
            RAISE EXCEPTION 'Insufficient stock for part ID: %', v_item.part_id;
        END IF;

        -- Insert Movement (Trigger will automatically update part stock)
        INSERT INTO public.inventory_movements (part_id, transaction_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
        VALUES (
            v_item.part_id,
            v_tx_id,
            CASE WHEN v_item.adj_type = 'Increase Stock' THEN 'POSITIVE_ADJUSTMENT' ELSE 'NEGATIVE_ADJUSTMENT' END,
            CASE WHEN v_item.adj_type = 'Increase Stock' THEN v_item.qty ELSE -v_item.qty END,
            v_item.unit_cost,
            p_reason,
            v_ref_no,
            p_notes,
            p_user_id
        );
    END LOOP;

    RETURN v_ref_no;
END;
$$ LANGUAGE plpgsql;


-- 6. RPC for Atomic Stock Swap
CREATE OR REPLACE FUNCTION process_stock_swap(
    p_reason TEXT,
    p_notes TEXT,
    p_part_out_id UUID,
    p_qty_out NUMERIC,
    p_part_in_id UUID,
    p_qty_in NUMERIC,
    p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_tx_id UUID;
    v_ref_no TEXT;
    v_part_out_stock NUMERIC;
BEGIN
    -- Generate Reference Number
    v_ref_no := 'SW-' || lpad(nextval('stock_swap_seq')::text, 5, '0');

    -- Insert Header
    INSERT INTO public.inventory_transactions (type, reference_number, reason, notes, created_by)
    VALUES ('SWAP', v_ref_no, p_reason, p_notes, p_user_id)
    RETURNING id INTO v_tx_id;

    -- Check OUT stock
    SELECT stock_quantity INTO v_part_out_stock FROM public.parts WHERE id = p_part_out_id FOR UPDATE;
    IF v_part_out_stock < p_qty_out THEN
        RAISE EXCEPTION 'Insufficient stock for part OUT ID: %', p_part_out_id;
    END IF;

    -- SWAP_OUT Movement
    INSERT INTO public.inventory_movements (part_id, transaction_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
    VALUES (p_part_out_id, v_tx_id, 'SWAP_OUT', -p_qty_out, 0, 'Swap', v_ref_no, p_notes, p_user_id);

    -- SWAP_IN Movement
    INSERT INTO public.inventory_movements (part_id, transaction_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
    VALUES (p_part_in_id, v_tx_id, 'SWAP_IN', p_qty_in, 0, 'Swap', v_ref_no, p_notes, p_user_id);

    RETURN v_ref_no;
END;
$$ LANGUAGE plpgsql;
