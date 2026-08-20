-- 1. Ensure required tables and sequences exist
CREATE SEQUENCE IF NOT EXISTS purchase_order_seq START 1;
CREATE SEQUENCE IF NOT EXISTS purchase_receipt_seq START 1;

CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    reference_number TEXT,
    notes TEXT,
    terms TEXT,
    status TEXT NOT NULL DEFAULT 'ORDERED',
    total_amount NUMERIC(12,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    part_id UUID REFERENCES public.parts(id) ON DELETE RESTRICT,
    qty_ordered NUMERIC(12,2) NOT NULL,
    qty_received NUMERIC(12,2) DEFAULT 0,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0
);

-- 2. Clean up any previous broken or overloaded RPC signatures
DROP FUNCTION IF EXISTS public.create_purchase_order(UUID, DATE, DATE, TEXT, TEXT, TEXT, JSONB, UUID);
DROP FUNCTION IF EXISTS public.create_purchase_order(UUID, DATE, JSONB, DATE, TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_purchase_order(DATE, JSONB, TEXT, DATE, TEXT, UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_purchase_order(UUID, DATE, JSONB, DATE, TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_purchase_order();

-- 3. Create the AUTHORITATIVE Purchase Order RPC
-- This signature EXACTLY matches the 8 parameters sent by the frontend.
CREATE OR REPLACE FUNCTION public.create_purchase_order(
    p_supplier_id UUID,
    p_order_date DATE,
    p_expected_date DATE,
    p_reference TEXT,
    p_terms TEXT,
    p_notes TEXT,
    p_items JSONB,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_po_id UUID;
    v_po_no TEXT;
    v_item RECORD;
    v_total NUMERIC := 0;
BEGIN
    -- Generate the PO Number safely
    v_po_no := 'PO-' || lpad(nextval('purchase_order_seq')::text, 5, '0');
    
    -- Insert the Parent PO Record
    INSERT INTO public.purchase_orders (
        po_number, supplier_id, order_date, expected_delivery_date, 
        reference_number, terms, notes, status, created_by
    )
    VALUES (
        v_po_no, p_supplier_id, p_order_date, p_expected_date, 
        p_reference, p_terms, p_notes, 'ORDERED', p_user_id
    )
    RETURNING id INTO v_po_id;
    
    -- Insert the Child PO Items
    -- The frontend passes: { part_id, qty, unit_cost, total_amount }
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(part_id UUID, qty NUMERIC, unit_cost NUMERIC, total_amount NUMERIC)
    LOOP
        INSERT INTO public.purchase_order_items (
            purchase_order_id, part_id, qty_ordered, qty_received, unit_cost, total_amount
        )
        VALUES (
            v_po_id, v_item.part_id, v_item.qty, 0, v_item.unit_cost, v_item.total_amount
        );
        v_total := v_total + v_item.total_amount;
    END LOOP;
    
    -- Update the PO Total Amount
    UPDATE public.purchase_orders SET total_amount = v_total WHERE id = v_po_id;
    
    -- Return the new Purchase Order ID
    RETURN v_po_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
