import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# 1. Update Imports
content = content.replace(
    "import { ResolvePartModal } from '@/components/quotations/ResolvePartModal'",
    "import { PackageResolveModal } from '@/components/quotations/PackageResolveModal'"
)

# 2. Update State
content = content.replace(
    "const [resolvePartInfo, setResolvePartInfo] = useState<{parentItemId: string, childItemId: string, categoryId: string} | null>(null)",
    "const [pendingPackage, setPendingPackage] = useState<any>(null)"
)

# 3. Update Initial Data Load (Flat List)
init_data_old = """      if (initialData.quotation_items) {
        // Reconstruct nested structure
        const topLevelItems: LineItem[] = []
        const packageItemsMap: Record<string, LineItem[]> = {}
        
        // First pass: sort and group
        const sortedItems = [...initialData.quotation_items].sort((a, b) => a.sort_order - b.sort_order)
        
        sortedItems.forEach(item => {
          if (item.parent_item_id) {
            if (!packageItemsMap[item.parent_item_id]) packageItemsMap[item.parent_item_id] = []
            packageItemsMap[item.parent_item_id].push({
              id: item.id,
              description: item.description || '',
              quantity: item.quantity,
              unit_price: item.unit_price,
              is_section_header: item.is_section_header,
              item_type: item.item_type,
              labor_service_id: item.labor_service_id,
              part_id: item.part_id,
              is_category: item.is_category,
              part_category_id: item.part_category_id,
              resolved_part_id: item.resolved_part_id,
              internal_price_snapshot: item.internal_price_snapshot,
              internal_amount_snapshot: item.internal_amount_snapshot
            })
          } else {
            topLevelItems.push({
              id: item.id,
              description: item.description || '',
              quantity: item.quantity,
              unit_price: item.unit_price,
              is_section_header: item.is_section_header,
              item_type: item.item_type || 'MANUAL',
              package_id: item.package_id,
              labor_service_id: item.labor_service_id,
              package_items: [] // Will populate next
            })
          }
        })
        
        topLevelItems.forEach(item => {
          if (packageItemsMap[item.id]) {
            item.package_items = packageItemsMap[item.id]
          }
        })
        
        setItems(topLevelItems)
      }"""

init_data_new = """      if (initialData.quotation_items) {
        const sortedItems = [...initialData.quotation_items].sort((a, b) => a.sort_order - b.sort_order)
        const flatItems: LineItem[] = sortedItems.map(item => ({
          id: item.id,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          is_section_header: item.is_section_header,
          item_type: item.item_type || 'MANUAL',
          package_id: item.package_id,
          parent_item_id: item.parent_item_id,
          labor_service_id: item.labor_service_id,
          part_id: item.part_id,
          is_category: item.is_category,
          part_category_id: item.part_category_id,
          resolved_part_id: item.resolved_part_id,
          internal_price_snapshot: item.internal_price_snapshot,
          internal_amount_snapshot: item.internal_amount_snapshot,
          group_id: item.group_id,
          category_id: item.category_id,
          group_name_snapshot: item.group_name_snapshot,
          category_name_snapshot: item.category_name_snapshot,
          standard_hour_snapshot: item.standard_hour_snapshot
        }))
        setItems(flatItems)
      }"""
content = content.replace(init_data_old, init_data_new)

# 4. Remove Package Sub-render in save logic
# Wait, let's just rewrite handleSave itemsToInsert building.
insert_logic_old = """      // 3. Insert Line Items
      const itemsToInsert: any[] = [];
      let sortOrder = 0;

      items.forEach((item) => {
        if (item.description.trim() === '' && !item.labor_service_id && !item.package_id && !item.part_id) return;
        
        // We preserve existing IDs when editing so parent_item_id mapping stays correct
        const headerId = isEditingQuote && initialData && item.id.length > 20 ? item.id : crypto.randomUUID();
        
        itemsToInsert.push({
          id: headerId,
          quotation_id: quote.id,
          sort_order: sortOrder++,
          item_type: item.item_type || (item.package_id ? 'PACKAGE' : 'MANUAL'),
          description: item.description,
          quantity: item.is_section_header ? null : (Number(item.quantity) || 1),
          unit_price: item.is_section_header ? null : (Number(item.unit_price) || 0),
          total_price: item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)),
          is_section_header: item.is_section_header,
          labor_service_id: item.labor_service_id || null,
          package_id: item.package_id || null,
          group_id: item.group_id || null,
          category_id: item.category_id || null,
          group_name_snapshot: item.group_name_snapshot || null,
          category_name_snapshot: item.category_name_snapshot || null,
          standard_hour_snapshot: item.standard_hour_snapshot || null,
          part_id: item.part_id || null
        });
        
        if (item.item_type === 'PACKAGE' && item.package_items) {
          item.package_items.forEach((child) => {
             itemsToInsert.push({
                quotation_id: quote.id,
                sort_order: sortOrder++,
                item_type: 'PACKAGE_ITEM',
                parent_item_id: headerId,
                description: child.description,
                quantity: Number(child.quantity) || 1,
                unit_price: 0, 
                total_price: 0,
                is_section_header: false,
                labor_service_id: child.labor_service_id || null,
                part_id: child.part_id || null,
                is_category: child.is_category || false,
                part_category_id: child.part_category_id || null,
                resolved_part_id: child.resolved_part_id || null,
                internal_price_snapshot: child.internal_price_snapshot || 0,
                internal_amount_snapshot: child.internal_amount_snapshot || 0,
             });
          });
        }
      });"""

# Because `items` is now completely flat, we can just map it directly.
insert_logic_new = """      // 3. Insert Line Items
      const itemsToInsert: any[] = [];
      let sortOrder = 0;

      items.forEach((item) => {
        if (item.description.trim() === '' && !item.labor_service_id && !item.package_id && !item.part_id && !item.is_category) return;
        
        itemsToInsert.push({
          id: item.id, // Using the exact UUID client generated or loaded
          quotation_id: quote.id,
          sort_order: sortOrder++,
          item_type: item.item_type || (item.package_id ? 'PACKAGE' : 'MANUAL'),
          description: item.description,
          quantity: item.is_section_header ? null : (Number(item.quantity) || 1),
          unit_price: item.is_section_header ? null : (Number(item.unit_price) || 0),
          total_price: item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)),
          is_section_header: item.is_section_header,
          labor_service_id: item.labor_service_id || null,
          package_id: item.package_id || null,
          parent_item_id: item.parent_item_id || null,
          group_id: item.group_id || null,
          category_id: item.category_id || null,
          group_name_snapshot: item.group_name_snapshot || null,
          category_name_snapshot: item.category_name_snapshot || null,
          standard_hour_snapshot: item.standard_hour_snapshot || null,
          part_id: item.part_id || null,
          is_category: item.is_category || false,
          part_category_id: item.part_category_id || null,
          resolved_part_id: item.resolved_part_id || null,
          internal_price_snapshot: item.internal_price_snapshot || 0,
          internal_amount_snapshot: item.internal_amount_snapshot || 0
        });
      });"""
content = re.sub(r"      \/\/ 3\. Insert Line Items[\s\S]*?\n      \}\);\n", insert_logic_new + "\n", content)


# 5. Update removeItem
# Removing a package must remove its children.
remove_item_old = """  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }"""
remove_item_new = """  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id && item.parent_item_id !== id))
  }"""
content = content.replace(remove_item_old, remove_item_new)

# Generate unique UUIDs for items
content = content.replace("Math.random().toString(36).substr(2, 9)", "crypto.randomUUID()")

# We'll save this intermediate result
with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
