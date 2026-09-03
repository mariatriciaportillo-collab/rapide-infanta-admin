const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/actions.ts';
let content = fs.readFileSync(path, 'utf8');

const itemsLogic = `
  // 5. Insert Items (With Parent UUID Mapping)
  const idMap = new Map()
  for (const item of estimate.estimate_items) {
    idMap.set(item.id, crypto.randomUUID())
  }

  const newItems = estimate.estimate_items.map((i: any) => ({
    id: idMap.get(i.id),
    invoice_id: inv.id,
    item_type: i.item_type,
    package_id: i.package_id,
    labor_service_id: i.labor_service_id,
    part_id: i.part_id, // Final replacement part is carried over accurately
    parent_item_id: i.parent_item_id ? idMap.get(i.parent_item_id) : null,
    is_section_header: i.is_section_header,
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total_price: i.total_price,
    sort_order: i.sort_order
  }))
`;

content = content.replace(/  \/\/ 5\. Insert Items[\s\S]*?const newItems = estimate\.estimate_items\.map\(\(i: any\) => \(\{[\s\S]*?sort_order: i\.sort_order\n  \}\)\)/, itemsLogic);
fs.writeFileSync(path, content);
