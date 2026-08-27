import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    qf = f.read()

qf = qf.replace(
    "const addItem = (isHeader: boolean) => {",
    "const addItem = (isHeader: boolean, type: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM' = 'MANUAL') => {"
)
qf = qf.replace(
    """      is_section_header: isHeader,
    }
    setItems([...items, newItem])""",
    """      is_section_header: isHeader,
      item_type: type
    }
    setItems([...items, newItem])"""
)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(qf)
