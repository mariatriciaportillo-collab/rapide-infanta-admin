import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

old_desc = """        description: pi.item_type === 'LABOR' 
          ? pi.labor_services?.name 
          : (pi.is_category ? (resolved?.name || pi.part_categories?.name) : pi.parts?.name),"""

new_desc = """        description: pi.item_type === 'LABOR' 
          ? (pi.labor_services?.name || 'Unknown Labor') 
          : (pi.is_category ? (resolved?.name || pi.part_categories?.name || 'Unknown Category') : (pi.parts?.name || 'Unknown Part')),"""

content = content.replace(old_desc, new_desc)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
