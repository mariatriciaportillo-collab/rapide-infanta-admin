import re

with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
    content = f.read()

# Add categoryIdFilter to props
content = content.replace(
    'disabled?: boolean\n}',
    'disabled?: boolean\n  categoryIdFilter?: string | null\n}'
)

content = content.replace(
    'disabled = false',
    'disabled = false,\n  categoryIdFilter = null'
)

# Modify query
query_old = """    const { data } = await supabase
      .from('parts')
      .select('id, name, display_name, part_number, stock_quantity, unit, cost, brands(name)')
      .eq('is_active', true)
      .order('name')"""
query_new = """    let query = supabase
      .from('parts')
      .select('id, name, display_name, part_number, stock_quantity, unit, cost, selling_price, brands(name)')
      .eq('is_active', true)
      .order('name')
    
    if (categoryIdFilter) {
      query = query.eq('category_id', categoryIdFilter)
    }
    const { data } = await query"""

content = content.replace(query_old, query_new)

# Modify selection fetch
fetch_old = """    const { data } = await supabase
      .from('parts')
      .select('id, name, display_name, part_number, stock_quantity, unit, cost, brands(name)')
      .eq('id', newPartId)
      .single()"""
fetch_new = """    const { data } = await supabase
      .from('parts')
      .select('id, name, display_name, part_number, stock_quantity, unit, cost, selling_price, brands(name)')
      .eq('id', newPartId)
      .single()"""
content = content.replace(fetch_old, fetch_new)

with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
    f.write(content)
