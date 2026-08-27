import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

type_old = """type LineItem = {
  id: string
  description: string
  quantity: number | ''
  unit_price: number | ''
  is_section_header: boolean
  
  labor_service_id?: string | null
  group_id?: string | null
  category_id?: string | null
  group_name_snapshot?: string | null
  category_name_snapshot?: string | null
  standard_hour_snapshot?: number | null
  is_manual_labor?: boolean
}"""

type_new = """type LineItem = {
  id: string
  description: string
  quantity: number | ''
  unit_price: number | ''
  is_section_header: boolean
  
  item_type?: 'MANUAL' | 'PACKAGE' | 'PACKAGE_ITEM'
  package_id?: string | null
  parent_item_id?: string | null
  is_category?: boolean
  part_category_id?: string | null
  resolved_part_id?: string | null
  part_id?: string | null
  
  package_items?: LineItem[] // Nested items for a package
  
  labor_service_id?: string | null
  group_id?: string | null
  category_id?: string | null
  group_name_snapshot?: string | null
  category_name_snapshot?: string | null
  standard_hour_snapshot?: number | null
  
  // For UI display
  resolved_part_name?: string | null
  internal_price_snapshot?: number
  internal_amount_snapshot?: number
}"""

content = content.replace(type_old, type_new)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
