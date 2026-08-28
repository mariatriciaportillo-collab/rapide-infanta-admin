import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

pattern = r"    setCustomerTin\(''\)"
replacement = "    setCustomerTin('')\n    setCustomerSearch('')"
content = re.sub(pattern, replacement, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
