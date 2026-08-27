import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Add the addPackageToItems function inside the component
add_pkg_fn = """  const addPackageToItems = (pkg: any, resolvedParts: Record<string, any> = {}) => {
    const headerId = crypto.randomUUID()
    const newItem: LineItem = {
      id: headerId,
      item_type: 'PACKAGE',
      package_id: pkg.id,
      description: pkg.name,
      quantity: 1,
      unit_price: pkg.package_price,
      is_section_header: false,
    }
    
    const childItems: LineItem[] = (pkg.package_items || []).map((pi: any) => {
      const resolved = resolvedParts[pi.id]
      return {
        id: crypto.randomUUID(),
        item_type: 'PACKAGE_ITEM',
        parent_item_id: headerId,
        description: pi.item_type === 'LABOR' 
          ? pi.labor_services?.name 
          : (pi.is_category ? (resolved?.name || pi.part_categories?.name) : pi.parts?.name),
        quantity: pi.quantity,
        unit_price: 0,
        is_section_header: false,
        labor_service_id: pi.labor_service_id,
        part_id: resolved ? resolved.id : pi.part_id,
        is_category: pi.is_category,
        part_category_id: pi.part_category_id,
        resolved_part_id: resolved ? resolved.id : null,
        resolved_part_name: resolved ? resolved.name : null,
        internal_price_snapshot: pi.price,
        internal_amount_snapshot: Number(pi.price) * Number(pi.quantity)
      }
    })
    
    setItems(prev => [...prev, newItem, ...childItems])
    setPendingPackage(null)
  }
"""
content = content.replace("  const addItem = ", add_pkg_fn + "\n  const addItem = ")

# Replace Package combobox onChange
pkg_combobox_old = """            onChange={(pkgId) => {
              const pkg = packages.find(p => p.id === pkgId)
              if (pkg) {
                const newItem: LineItem = {
                  id: crypto.randomUUID(),
                  item_type: 'PACKAGE',
                  package_id: pkg.id,
                  description: pkg.name,
                  quantity: 1,
                  unit_price: pkg.package_price,
                  is_section_header: false,
                  package_items: (pkg.package_items || []).map((pi: any) => ({
                    id: crypto.randomUUID(),
                    item_type: 'PACKAGE_ITEM',
                    description: pi.item_type === 'LABOR' 
                      ? pi.labor_services?.name 
                      : (pi.is_category ? pi.part_categories?.name : pi.parts?.name),
                    quantity: pi.quantity,
                    unit_price: 0,
                    is_section_header: false,
                    labor_service_id: pi.labor_service_id,
                    part_id: pi.part_id,
                    is_category: pi.is_category,
                    part_category_id: pi.part_category_id,
                    resolved_part_id: null,
                    internal_price_snapshot: pi.price,
                    internal_amount_snapshot: Number(pi.price) * Number(pi.quantity)
                  }))
                }
                setItems(prev => [...prev, newItem])
              }
            }}"""

pkg_combobox_new = """            onChange={(pkgId) => {
              const pkg = packages.find(p => p.id === pkgId)
              if (pkg) {
                const needsResolution = (pkg.package_items || []).some((pi: any) => pi.is_category)
                if (needsResolution) {
                  setPendingPackage(pkg)
                } else {
                  addPackageToItems(pkg)
                }
              }
            }}"""
content = content.replace(pkg_combobox_old, pkg_combobox_new)


# Update Modal Rendering
modal_render_old = """      {/* RESOLVE PART MODAL */}
      {resolvePartInfo && (
        <ResolvePartModal
          categoryId={resolvePartInfo.categoryId}
          parentItemId={resolvePartInfo.parentItemId}
          childItemId={resolvePartInfo.childItemId}
          onClose={() => setResolvePartInfo(null)}
          onResolve={(part) => {
            setItems(prev => prev.map(item => {
              if (item.id === resolvePartInfo.parentItemId && item.package_items) {
                return {
                  ...item,
                  package_items: item.package_items.map(child => {
                    if (child.id === resolvePartInfo.childItemId) {
                      return {
                        ...child,
                        resolved_part_id: part.id,
                        resolved_part_name: part.name
                      }
                    }
                    return child;
                  })
                }
              }
              return item;
            }))
            setResolvePartInfo(null)
          }}
        />
      )}"""

modal_render_new = """      {/* RESOLVE PACKAGE MODAL */}
      {pendingPackage && (
        <PackageResolveModal
          pkg={pendingPackage}
          onClose={() => setPendingPackage(null)}
          onApply={(resolvedParts) => addPackageToItems(pendingPackage, resolvedParts)}
        />
      )}"""
content = content.replace(modal_render_old, modal_render_new)

# Remove the nested package_items map from Section 1 (Packages)
# It starts at: {/* Package Items details */} and goes up to the end of the package card.
# Because regex can be tricky with HTML, I will replace the exact JSX block.
# Let's extract the exact text using python.
