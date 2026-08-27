import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

insert_old = """      // 3. Insert Line Items
      const itemsToInsert = items
        .filter(i => i.description.trim() !== '' || i.labor_service_id)
        .map((item, index) => ({
          quotation_id: quote.id,
          sort_order: index,
          description: item.description,
          quantity: item.is_section_header ? null : (Number(item.quantity) || 1),
          unit_price: item.is_section_header ? null : (Number(item.unit_price) || 0),
          total_price: item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)),
          is_section_header: item.is_section_header,
          labor_service_id: item.labor_service_id || null,
          group_id: item.group_id || null,
          category_id: item.category_id || null,
          group_name_snapshot: item.group_name_snapshot || null,
          category_name_snapshot: item.category_name_snapshot || null,
          standard_hour_snapshot: item.standard_hour_snapshot || null
        }))"""

insert_new = """      // 3. Insert Line Items
      const itemsToInsert: any[] = [];
      let sortOrder = 0;

      items.forEach((item) => {
        if (item.description.trim() === '' && !item.labor_service_id && !item.package_id) return;
        
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
          standard_hour_snapshot: item.standard_hour_snapshot || null
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
      });
"""
content = content.replace(insert_old, insert_new)

# Wait, if we are editing, we need to delete existing quotation_items first before re-inserting, or we just rely on delete and insert?
# Yes, for editing quotations, deleting and re-inserting items is safest if we allow arbitrary reorders.
# Let's check how saving works. Is there a quote update logic?
