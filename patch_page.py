import re

with open('src/app/(dashboard)/labor-lookup/page.tsx', 'r') as f:
    content = f.read()

# Remove the prop from LaborLookupClient invocation
content = re.sub(r'lookupRates=\{lookupRates \|\| \[\]\}', '', content)

with open('src/app/(dashboard)/labor-lookup/page.tsx', 'w') as f:
    f.write(content)
