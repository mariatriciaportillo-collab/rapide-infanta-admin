-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    branch TEXT,
    mobile TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Intervals Settings
CREATE TABLE IF NOT EXISTS service_intervals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type TEXT NOT NULL, -- e.g., 'Oil Change', 'PMS'
    classification TEXT NOT NULL, -- e.g., 'Regular / Mineral', 'Semi Synthetic', 'Fully Synthetic'
    months INT NOT NULL,
    kilometers INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_type, classification)
);

-- Default Service Intervals
INSERT INTO service_intervals (service_type, classification, months, kilometers) VALUES
('Oil Change', 'Regular / Mineral', 3, 5000),
('Oil Change', 'Semi Synthetic', 6, 7000),
('Oil Change', 'Fully Synthetic', 6, 10000)
ON CONFLICT (service_type, classification) DO NOTHING;

-- Service History
CREATE TABLE IF NOT EXISTS service_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    service_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    mileage INT,
    service_name TEXT,
    oil_type TEXT,
    parts_used JSONB,
    next_due_date DATE,
    next_due_mileage INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alter vehicles to ensure we have the new fields (if not already there)
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS vin text,
ADD COLUMN IF NOT EXISTS engine_capacity text;

-- Create an RPC to safely execute these so I can call it from node if I have admin access, though I'll just save this file.

-- Add service_advisor_id to quotations (and estimates/invoices if they share it, but assuming quotations covers estimates as they are the same table usually)
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Note: We assume Invoices either inherit this or have their own.
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS service_advisor_id UUID REFERENCES employees(id) ON DELETE SET NULL;
