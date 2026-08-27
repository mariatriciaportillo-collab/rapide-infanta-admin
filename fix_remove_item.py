import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    qf = f.read()

qf = qf.replace(
    "setItems(items.filter(item => item.id !== id && item.parent_item_id !== id))",
    "setItems(prev => prev.filter(item => item.id !== id && item.parent_item_id !== id))"
)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(qf)
