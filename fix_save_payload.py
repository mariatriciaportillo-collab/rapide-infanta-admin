import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# I will find the itemsToInsert map block and replace it carefully.

old_map = r"""      const itemsToInsert = items
        \.filter\(i => i\.description\.trim\(\) !== '' \|\| i\.labor_service_id\)
        \.map\(\(item, index\) => \(\{
          quotation_id: quote\.id,
          sort_order: index,
          description: item\.description,
          quantity: item\.is_section_header \? null : \(Number\(item\.quantity\) \|\| 1\),
          unit_price: item\.is_section_header \? null : \(Number\(item\.unit_price\) \|\| 0\),
          total_price: item\.is_section_header \? 0 : \(\(Number\(item\.quantity\) \|\| 0\) \* \(Number\(item\.unit_price\) \|\| 0\)\),
          is_section_header: item\.is_section_header,
          labor_service_id: item\.labor_service_id \|\| null,
          group_id: item\.group_id \|\| null,
          category_id: item\.category_id \|\| null,
          group_name_snapshot: item\.group_name_snapshot \|\| null,
          category_name_snapshot: item\.category_name_snapshot \|\| null,
          standard_hour_snapshot: item\.standard_hour_snapshot \|\| null
        \}\)\)"""

new_map = """      const itemsToInsert = items
        .filter(i => (i.description && i.description.trim() !== '') || i.labor_service_id || i.part_id || i.package_id || i.is_category)
        .map((item, index) => ({
          // IMPORTANT: Include id so parent_item_id references map correctly if generating new UI UUIDs!
          id: item.id,
          quotation_id: quote.id,
          sort_order: index,
          item_type: item.item_type || (item.package_id && !item.parent_item_id ? 'PACKAGE' : 'MANUAL'),
          description: item.description,
          quantity: item.is_section_header ? null : (Number(item.quantity) || 1),
          unit_price: item.is_section_header ? null : (Number(item.unit_price) || 0),
          total_price: item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)),
          is_section_header: item.is_section_header,
          labor_service_id: item.labor_service_id || null,
          package_id: item.package_id || null,
          parent_item_id: item.parent_item_id || null,
          part_id: item.part_id || null,
          is_category: item.is_category || false,
          part_category_id: item.part_category_id || null,
          resolved_part_id: item.resolved_part_id || null,
          internal_price_snapshot: item.internal_price_snapshot || 0,
          internal_amount_snapshot: item.internal_amount_snapshot || 0,
          group_id: item.group_id || null,
          category_id: item.category_id || null,
          group_name_snapshot: item.group_name_snapshot || null,
          category_name_snapshot: item.category_name_snapshot || null,
          standard_hour_snapshot: item.standard_hour_snapshot || null
        }))"""

if re.search(old_map, content):
    print("Found exact regex match!")
else:
    print("WARNING: Regex didn't match. Attempting fallback text replacement...")

content = re.sub(old_map, new_map, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
