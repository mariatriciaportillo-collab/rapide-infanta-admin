import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Add useEffect for initialData
init_code = """
  // Load initialData
  useEffect(() => {
    if (initialData) {
      setSelectedCustomerId(initialData.customer_id)
      setSelectedVehicleId(initialData.vehicle_id || null)
      setNotes(initialData.notes || '')
      setWarranty(initialData.warranty_terms || '')
      setPreparedBy(initialData.prepared_by || '')
      setDiscount(initialData.discount_amount || 0)
      
      if (initialData.customers) {
        setDisplayCustomerName(formatCustomerName(initialData.customers))
        setDisplayContactPerson(formatContactPerson(initialData.customers))
      }

      if (initialData.quotation_items) {
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
      }
    }
  }, [initialData])
"""
content = content.replace("  const searchRef = useRef<HTMLDivElement>(null)", "  const searchRef = useRef<HTMLDivElement>(null)\n" + init_code)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
