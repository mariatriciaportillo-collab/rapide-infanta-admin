import re

def patch():
    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'r') as f:
        code = f.read()

    old_update = "unitCost: value.cost ? value.cost.toString() : ''"
    new_update = "unitCost: item.unitCost ? item.unitCost : (value.cost ? value.cost.toString() : '')"
    
    code = code.replace(old_update, new_update)

    with open('src/app/(dashboard)/outside-purchases/new/page.tsx', 'w') as f:
        f.write(code)

patch()
