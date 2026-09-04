-- 1. Add auto_suggest_labor flag to parts
ALTER TABLE parts ADD COLUMN IF NOT EXISTS auto_suggest_labor BOOLEAN DEFAULT FALSE;

-- 2. Create the Part-to-Labor Rules table
CREATE TABLE IF NOT EXISTS part_labor_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) DEFAULT 'SINGLE', -- SINGLE, COMBINATION
    labor_id UUID REFERENCES labor_charges(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the Triggers join table (which parts trigger the rule)
CREATE TABLE IF NOT EXISTS part_labor_rule_triggers (
    rule_id UUID REFERENCES part_labor_rules(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
    PRIMARY KEY (rule_id, part_id)
);

-- 4. Enable RLS and add policies
ALTER TABLE part_labor_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_labor_rule_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to part_labor_rules" ON part_labor_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to part_labor_rule_triggers" ON part_labor_rule_triggers FOR ALL TO authenticated USING (true);

-- 5. Add a helper view to make it easy to query rules with their triggers in one go
CREATE OR REPLACE VIEW part_labor_rules_view AS
SELECT 
    r.id,
    r.rule_name,
    r.rule_type,
    r.labor_id,
    r.active,
    r.notes,
    COALESCE(
        json_agg(
            json_build_object(
                'part_id', t.part_id
            )
        ) FILTER (WHERE t.part_id IS NOT NULL), 
        '[]'
    ) as triggers
FROM part_labor_rules r
LEFT JOIN part_labor_rule_triggers t ON r.id = t.rule_id
GROUP BY r.id;

