import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Replace types
content = content.replace(
    "item_type?: 'MANUAL' | 'PACKAGE' | 'PACKAGE_ITEM'",
    "item_type?: 'MANUAL' | 'LABOR' | 'PART' | 'PACKAGE' | 'PACKAGE_ITEM'"
)

# We need to import PartSearchSelector in QuotationForm
if "import { PartSearchSelector }" not in content:
    content = content.replace(
        "import { ResolvePartModal } from '@/components/quotations/ResolvePartModal'",
        "import { ResolvePartModal } from '@/components/quotations/ResolvePartModal'\nimport { PartSearchSelector } from '@/components/parts/PartSearchSelector'"
    )

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
