import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    qf = f.read()

add_pkg_fn = """  const addPackageToItems = (pkg: any, resolvedParts: Record<string, any> = {}) => {
    const headerId = crypto.randomUUID()
    const newItem: LineItem = {
      id: headerId,
      item_type: 'PACKAGE',
      package_id: pkg.id,
      description: pkg.name,
      quantity: 1,
      unit_price: pkg.package_price,
      is_section_header: false,
    }
    
    const childItems: LineItem[] = (pkg.package_items || []).map((pi: any) => {
      const resolved = resolvedParts[pi.id]
      return {
        id: crypto.randomUUID(),
        item_type: 'PACKAGE_ITEM',
        parent_item_id: headerId,
        description: pi.item_type === 'LABOR' 
          ? pi.labor_services?.name 
          : (pi.is_category ? (resolved?.name || pi.part_categories?.name) : pi.parts?.name),
        quantity: pi.quantity,
        unit_price: 0,
        is_section_header: false,
        labor_service_id: pi.labor_service_id,
        part_id: resolved ? resolved.id : pi.part_id,
        is_category: pi.is_category,
        part_category_id: pi.part_category_id,
        resolved_part_id: resolved ? resolved.id : null,
        resolved_part_name: resolved ? resolved.name : null,
        internal_price_snapshot: pi.price,
        internal_amount_snapshot: Number(pi.price) * Number(pi.quantity)
      }
    })
    
    setItems(prev => [...prev, newItem, ...childItems])
    setPendingPackage(null)
  }
"""

# Insert right before const addItem =
qf = qf.replace(
    "const addItem = (isHeader: boolean, type: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM' = 'MANUAL') => {",
    add_pkg_fn + "\n  const addItem = (isHeader: boolean, type: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM' = 'MANUAL') => {"
)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(qf)
