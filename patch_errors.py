import re

def patch():
    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'r') as f:
        code = f.read()

    code = code.replace('setError("Please select a Supplier.")', 'setError("Supplier is required.")')
    code = code.replace('setError(`Please select a Part for line ${i + 1}.`)', 'setError(`Part / Material is required for line ${i + 1}.`)')
    code = code.replace('setError(`Please select a Part / Material for line ${i + 1}.`)', 'setError(`Part / Material is required for line ${i + 1}.`)')

    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'w') as f:
        f.write(code)

patch()
