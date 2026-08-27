import re

# 1. Update addItem in QuotationForm.tsx
with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    qf = f.read()

qf = qf.replace(
    "const addItem = (isSectionHeader: boolean) => {",
    "const addItem = (isSectionHeader: boolean, type: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM' = 'MANUAL') => {"
)
# Ensure the inserted manual item takes the type
qf = qf.replace(
    """      is_section_header: isSectionHeader,
    }
    setItems([...items, newItem])""",
    """      is_section_header: isSectionHeader,
      item_type: type
    }
    setItems([...items, newItem])"""
)
with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(qf)

# 2. Update Part type in PartSearchSelector.tsx
with open('src/components/parts/PartSearchSelector.tsx', 'r') as f:
    pss = f.read()

pss = pss.replace(
    """  unit: string
  cost: number
  brands: any""",
    """  unit: string
  cost: number
  selling_price?: number | null
  brands: any"""
)

with open('src/components/parts/PartSearchSelector.tsx', 'w') as f:
    f.write(pss)
