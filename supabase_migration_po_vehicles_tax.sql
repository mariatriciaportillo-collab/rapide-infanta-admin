-- 1. Add new columns to purchase_orders
ALTER TABLE public.purchase_orders 
ADD COLUMN IF NOT EXISTS has_vehicle_details BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tax_treatment TEXT DEFAULT 'NON_VAT';

-- 2. Add new columns to purchase_order_items
ALTER TABLE public.purchase_order_items
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS manual_vehicle TEXT,
ADD COLUMN IF NOT EXISTS chassis_number TEXT;

-- 3. Replace the create_purchase_order RPC to support new fields
DROP FUNCTION IF EXISTS public.create_purchase_order(UUID, DATE, DATE, TEXT, TEXT, TEXT, JSONB, UUID);
DROP FUNCTION IF EXISTS public.create_purchase_order(UUID, DATE, DATE, TEXT, TEXT, TEXT, JSONB, UUID, BOOLEAN, TEXT);

CREATE OR REPLACE FUNCTION public.create_purchase_order(
    p_supplier_id UUID,
    p_order_date DATE,
    p_expected_date DATE,
    p_reference TEXT,
    p_terms TEXT,
    p_notes TEXT,
    p_items JSONB,
    p_user_id UUID,
    p_has_vehicle_details BOOLEAN DEFAULT false,
    p_tax_treatment TEXT DEFAULT 'NON_VAT'
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
        reference_number, terms, notes, status, created_by,
        has_vehicle_details, tax_treatment
    )
    VALUES (
        v_po_no, p_supplier_id, p_order_date, p_expected_date, 
        p_reference, p_terms, p_notes, 'ORDERED', p_user_id,
        COALESCE(p_has_vehicle_details, false), COALESCE(p_tax_treatment, 'NON_VAT')
    )
    RETURNING id INTO v_po_id;
    
    -- Insert the Child PO Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        part_id UUID, qty NUMERIC, unit_cost NUMERIC, total_amount NUMERIC, 
        vehicle_id UUID, manual_vehicle TEXT, chassis_number TEXT
    )
    LOOP
        INSERT INTO public.purchase_order_items (
            purchase_order_id, part_id, qty_ordered, qty_received, unit_cost, total_amount,
            vehicle_id, manual_vehicle, chassis_number
        )
        VALUES (
            v_po_id, v_item.part_id, v_item.qty, 0, v_item.unit_cost, v_item.total_amount,
            v_item.vehicle_id, v_item.manual_vehicle, v_item.chassis_number
        );
        v_total := v_total + v_item.total_amount;
    END LOOP;
    
    -- Update the PO Total Amount
    UPDATE public.purchase_orders SET total_amount = v_total WHERE id = v_po_id;
    
    -- Return the new Purchase Order ID
    RETURN v_po_id;
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
