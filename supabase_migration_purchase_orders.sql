-- 1. Sequences for PO and Receipts
CREATE SEQUENCE IF NOT EXISTS purchase_order_seq START 1;
CREATE SEQUENCE IF NOT EXISTS purchase_receipt_seq START 1;

-- 2. Purchase Orders Header Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    reference_number TEXT,
    notes TEXT,
    terms TEXT,
    status TEXT NOT NULL DEFAULT 'ORDERED', -- ORDERED, PARTIALLY RECEIVED, RECEIVED, CANCELLED
    total_amount NUMERIC(12,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Purchase Order Items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts(id) ON DELETE RESTRICT,
    qty_ordered NUMERIC(12,2) NOT NULL,
    qty_received NUMERIC(12,2) DEFAULT 0,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0
);

-- 4. Purchase Receipts Header
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

-- 5. Purchase Receipt Items
CREATE TABLE IF NOT EXISTS public.purchase_receipt_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id UUID REFERENCES public.purchase_receipts(id) ON DELETE CASCADE,
    po_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts(id) ON DELETE RESTRICT,
    qty_received NUMERIC(12,2) NOT NULL,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0
);

-- 6. RPC for Atomic Purchase Order Creation
CREATE OR REPLACE FUNCTION create_purchase_order(
    p_supplier_id UUID,
    p_order_date DATE,
    p_expected_date DATE,
    p_reference TEXT,
    p_notes TEXT,
    p_terms TEXT,
    p_items JSONB,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_po_id UUID;
    v_po_no TEXT;
    v_item RECORD;
    v_total NUMERIC := 0;
BEGIN
    v_po_no := 'PO-' || lpad(nextval('purchase_order_seq')::text, 5, '0');
    
    INSERT INTO public.purchase_orders (po_number, supplier_id, order_date, expected_delivery_date, reference_number, notes, terms, status, created_by)
    VALUES (v_po_no, p_supplier_id, p_order_date, p_expected_date, p_reference, p_notes, p_terms, 'ORDERED', p_user_id)
    RETURNING id INTO v_po_id;
    
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(part_id UUID, qty NUMERIC, unit_cost NUMERIC, total_amount NUMERIC)
    LOOP
        INSERT INTO public.purchase_order_items (purchase_order_id, part_id, qty_ordered, qty_received, unit_cost, total_amount)
        VALUES (v_po_id, v_item.part_id, v_item.qty, 0, v_item.unit_cost, v_item.total_amount);
        v_total := v_total + v_item.total_amount;
    END LOOP;
    
    UPDATE public.purchase_orders SET total_amount = v_total WHERE id = v_po_id;
    
    RETURN v_po_id;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC for Receiving PO Items
CREATE OR REPLACE FUNCTION receive_po_items(
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
    v_po_no TEXT;
    v_item RECORD;
    v_new_rcv_qty NUMERIC;
    v_ordered_qty NUMERIC;
    v_all_received BOOLEAN := true;
    v_po_item RECORD;
BEGIN
    -- Get PO Details
    SELECT po_number INTO v_po_no FROM public.purchase_orders WHERE id = p_po_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase Order not found';
    END IF;

    -- Create Receipt Header
    v_rcv_no := 'RCV-' || lpad(nextval('purchase_receipt_seq')::text, 5, '0');
    INSERT INTO public.purchase_receipts (purchase_order_id, receipt_number, supplier_reference, receive_date, notes, created_by)
    VALUES (p_po_id, v_rcv_no, p_supplier_ref, p_receive_date, p_notes, p_user_id)
    RETURNING id INTO v_receipt_id;

    -- Process Received Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(po_item_id UUID, part_id UUID, qty NUMERIC, unit_cost NUMERIC, total_amount NUMERIC)
    LOOP
        IF v_item.qty > 0 THEN
            -- Check PO Item
            SELECT qty_ordered, qty_received INTO v_ordered_qty, v_new_rcv_qty FROM public.purchase_order_items WHERE id = v_item.po_item_id FOR UPDATE;
            
            IF (v_new_rcv_qty + v_item.qty) > v_ordered_qty THEN
                RAISE EXCEPTION 'Cannot receive more than ordered for item %', v_item.po_item_id;
            END IF;

            -- Update PO Item
            UPDATE public.purchase_order_items 
            SET qty_received = qty_received + v_item.qty 
            WHERE id = v_item.po_item_id;

            -- Insert Receipt Item
            INSERT INTO public.purchase_receipt_items (receipt_id, po_item_id, part_id, qty_received, unit_cost, total_amount)
            VALUES (v_receipt_id, v_item.po_item_id, v_item.part_id, v_item.qty, v_item.unit_cost, v_item.total_amount);

            -- Create Inventory Movement (trigger will update stock)
            INSERT INTO public.inventory_movements (part_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
            VALUES (v_item.part_id, 'PURCHASE_ORDER_RECEIPT', v_item.qty, v_item.unit_cost, 'Purchase Receipt', v_rcv_no, p_notes, p_user_id);
        END IF;
    END LOOP;

    -- Update PO Status
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

