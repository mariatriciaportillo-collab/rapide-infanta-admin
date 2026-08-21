-- 1. Ensure Sequences and Tables exist (Safe, non-destructive)
CREATE SEQUENCE IF NOT EXISTS purchase_receipt_seq START 1;

CREATE TABLE IF NOT EXISTS public.purchase_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL UNIQUE,
    supplier_reference TEXT,
    receive_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_receipt_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id UUID REFERENCES public.purchase_receipts(id) ON DELETE CASCADE,
    po_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts(id) ON DELETE RESTRICT,
    qty_received NUMERIC(12,2) NOT NULL,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0
);

-- 2. Explicitly Enable Row Level Security
ALTER TABLE public.purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_receipt_items ENABLE ROW LEVEL SECURITY;

-- 3. Safely apply RLS Policies without overwriting existing ones
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_receipts' AND policyname = 'Public read purchase_receipts') THEN
        CREATE POLICY "Public read purchase_receipts" ON public.purchase_receipts FOR SELECT USING (true);
        CREATE POLICY "Admin manage purchase_receipts" ON public.purchase_receipts FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_receipt_items' AND policyname = 'Public read purchase_receipt_items') THEN
        CREATE POLICY "Public read purchase_receipt_items" ON public.purchase_receipt_items FOR SELECT USING (true);
        CREATE POLICY "Admin manage purchase_receipt_items" ON public.purchase_receipt_items FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 4. Clean up old function signatures (Triggers "Destructive" warning in Supabase, but only removes broken functions)
DROP FUNCTION IF EXISTS public.receive_po_items(UUID, DATE, TEXT, TEXT, JSONB, UUID);
DROP FUNCTION IF EXISTS public.receive_po_items(JSONB, UUID, DATE, UUID);
DROP FUNCTION IF EXISTS public.receive_po_items(JSONB, TEXT, UUID, DATE, TEXT, UUID);
DROP FUNCTION IF EXISTS public.receive_po_items();

-- 5. Create the Final Authoritative RPC
CREATE OR REPLACE FUNCTION public.receive_po_items(
    p_po_id UUID,
    p_receive_date DATE,
    p_supplier_ref TEXT,
    p_notes TEXT,
    p_items JSONB,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_receipt_id UUID;
    v_rcv_no TEXT;
    v_item RECORD;
    v_new_rcv_qty NUMERIC;
    v_ordered_qty NUMERIC;
    v_all_received BOOLEAN := true;
    v_po_item RECORD;
BEGIN
    -- Validate PO Exists
    PERFORM id FROM public.purchase_orders WHERE id = p_po_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase Order not found';
    END IF;

    -- Create Receipt Parent Header
    v_rcv_no := 'RCV-' || lpad(nextval('purchase_receipt_seq')::text, 5, '0');
    INSERT INTO public.purchase_receipts (
        purchase_order_id, receipt_number, supplier_reference, receive_date, notes, created_by
    )
    VALUES (
        p_po_id, v_rcv_no, p_supplier_ref, p_receive_date, p_notes, p_user_id
    )
    RETURNING id INTO v_receipt_id;

    -- Process Received Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(po_item_id UUID, part_id UUID, qty NUMERIC, unit_cost NUMERIC, total_amount NUMERIC)
    LOOP
        IF v_item.qty > 0 THEN
            -- Validate Line Quantities and lock row
            SELECT qty_ordered, qty_received INTO v_ordered_qty, v_new_rcv_qty 
            FROM public.purchase_order_items 
            WHERE id = v_item.po_item_id FOR UPDATE;
            
            IF (v_new_rcv_qty + v_item.qty) > v_ordered_qty THEN
                RAISE EXCEPTION 'Cannot receive more than ordered for item %', v_item.po_item_id;
            END IF;

            -- Update PO Item
            UPDATE public.purchase_order_items 
            SET qty_received = qty_received + v_item.qty 
            WHERE id = v_item.po_item_id;

            -- Insert Receipt Item
            INSERT INTO public.purchase_receipt_items (
                receipt_id, po_item_id, part_id, qty_received, unit_cost, total_amount
            )
            VALUES (
                v_receipt_id, v_item.po_item_id, v_item.part_id, v_item.qty, v_item.unit_cost, v_item.total_amount
            );

            -- Create Inventory Movement
            -- The existing trigger on inventory_movements will automatically update parts.stock_quantity
            INSERT INTO public.inventory_movements (
                part_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by
            )
            VALUES (
                v_item.part_id, 'PURCHASE_ORDER_RECEIPT', v_item.qty, v_item.unit_cost, 'Purchase Receipt', v_rcv_no, p_notes, p_user_id
            );
        END IF;
    END LOOP;

    -- Calculate Overall PO Status
    FOR v_po_item IN SELECT qty_ordered, qty_received FROM public.purchase_order_items WHERE purchase_order_id = p_po_id
    LOOP
        IF v_po_item.qty_received < v_po_item.qty_ordered THEN
            v_all_received := false;
        END IF;
    END LOOP;

    IF v_all_received THEN
        UPDATE public.purchase_orders SET status = 'RECEIVED', updated_at = NOW() WHERE id = p_po_id;
    ELSE
        UPDATE public.purchase_orders SET status = 'PARTIALLY RECEIVED', updated_at = NOW() WHERE id = p_po_id;
    END IF;

    RETURN v_receipt_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
