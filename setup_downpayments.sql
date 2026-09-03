-- 1. Add downpayment logic to quotations
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS parts_order_required BOOLEAN;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS vehicle_stays BOOLEAN;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS downpayment_required BOOLEAN;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS required_downpayment_amount NUMERIC(10,2);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS downpayment_paid_amount NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS downpayment_status VARCHAR(50) DEFAULT 'NONE'; -- NONE, REQUIRED, PARTIAL, PAID

-- 2. Link estimates to their source quotation
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id);
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS downpayment_carried NUMERIC(10,2) DEFAULT 0.00;

-- 3. Enhance payments table to support Quotation Downpayments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'STANDARD'; -- STANDARD, DOWNPAYMENT
ALTER TABLE payments ADD COLUMN IF NOT EXISTS source_type VARCHAR(50); -- INVOICE, QUICKSALE, QUOTATION
ALTER TABLE payments ADD COLUMN IF NOT EXISTS source_reference VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS quotation_total NUMERIC(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS required_downpayment NUMERIC(10,2);

-- 4. Update invoices to reflect downpayment balance
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS downpayment_applied NUMERIC(10,2) DEFAULT 0.00;
