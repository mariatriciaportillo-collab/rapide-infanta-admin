import re

with open('src/app/(dashboard)/packages/components/PackageForm.tsx', 'r') as f:
    content = f.read()

# Replace overflow-x-auto with overflow-visible in the table wrappers
content = content.replace('className="p-0 overflow-x-auto flex-1"', 'className="p-0 overflow-visible"')

with open('src/app/(dashboard)/packages/components/PackageForm.tsx', 'w') as f:
    f.write(content)
