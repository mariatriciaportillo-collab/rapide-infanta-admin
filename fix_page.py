import re

with open('src/app/(dashboard)/labor-lookup/page.tsx', 'r') as f:
    content = f.read()

# Fix the props
old_props = """        <LaborLookupClient 
          makes={makes || []} 
          models={models || []} 
          services={services || []}
          groups={groups || []}
          categories={categories || []}
          lookupRates={lookupRates || []} 
        />"""

new_props = """        <LaborLookupClient 
          makes={makes || []} 
          models={models || []} 
          services={services || []}
          lookupRates={lookupRates || []} 
        />"""

content = content.replace(old_props, new_props)

with open('src/app/(dashboard)/labor-lookup/page.tsx', 'w') as f:
    f.write(content)

