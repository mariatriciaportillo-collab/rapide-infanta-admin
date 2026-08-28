import re

files = [
    'src/app/(dashboard)/quotations/[id]/print/page.tsx',
    'src/app/(dashboard)/quotations/[id]/page.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # 1. Replace filtering logic
    old_filter_pattern = r"const packages = sortedItems\.filter[\s\S]*?const partItems = sortedItems\.filter[^\n]*\n"
    
    new_filter = """          const isPkg = (i: any) => i.item_type === 'PACKAGE' || (!i.parent_item_id && i.package_id);
          const isPrt = (i: any) => i.item_type === 'PART' || (!i.parent_item_id && i.part_id && !i.package_id) || (i.parent_item_id && (i.part_id || i.is_category));
          const isLbr = (i: any) => !isPkg(i) && !isPrt(i);

          const packages = sortedItems.filter(isPkg);
          const partItems = sortedItems.filter(isPrt);
          const laborItems = sortedItems.filter(isLbr);
"""
    content = re.sub(old_filter_pattern, new_filter, content)

    # 2. Replace `item.item_type === 'PACKAGE_ITEM'` with `!!item.parent_item_id` in the UI rendering
    # Because for old data, item_type might not be 'PACKAGE_ITEM' but parent_item_id will definitely exist.
    content = content.replace("item.item_type === 'PACKAGE_ITEM'", "!!item.parent_item_id")

    # 3. Add explicit check to make sure "Included in Package" relies solely on parent_item_id
    with open(file, 'w') as f:
        f.write(content)

print("Patch applied.")
