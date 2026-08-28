import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

pattern = r"    setCustomerSearch\(''\)\n"
replacement = r"    setCustomerSearch('')\n    setIsAddingCustomer(false)\n    setIsEditingCustomer(false)\n"
content = re.sub(pattern, replacement, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
