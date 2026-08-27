import re

with open('src/app/(dashboard)/packages/page.tsx', 'r') as f:
    content = f.read()

replacement = """
  const items = pkg.package_items || []
  
  const laborItems = items.filter((i: any) => i.item_type === 'LABOR')
  const partItems = items.filter((i: any) => i.item_type === 'PART')
  
  let regularValue = 0;
  let hasCategoryParts = false;
  items.forEach((item: any) => {
    if (item.item_type === 'PART' && item.is_category) {
      hasCategoryParts = true;
      return;
    }
    const isLabor = item.item_type === 'LABOR'
    const qty = Number(item.quantity) || 1
    const sellingPrice = isLabor ? Number(item.labor_services?.rate) || 0 : Number(item.parts?.selling_price) || 0
    regularValue += (sellingPrice * qty)
  })

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Items in {pkg.name}</h3>
            {pkg.package_code && <p className="text-sm text-slate-500 font-mono mt-0.5">{pkg.package_code}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-0 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3 font-bold">Type</th>
                <th className="px-6 py-3 font-bold">Requirement</th>
                <th className="px-6 py-3 font-bold text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laborItems.map((item: any, i: number) => (
                <tr key={`labor-${i}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-indigo-600 font-bold">Labor</td>
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{item.labor_services?.name || 'Unknown Item'}</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-600 font-medium">{Number(item.quantity) || 1}</td>
                </tr>
              ))}
              
              {partItems.map((item: any, i: number) => (
                <tr key={`part-${i}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-bold">
                    {item.is_category ? (
                      <span className="text-amber-600">Part Category</span>
                    ) : (
                      <span className="text-emerald-600">Fixed Part</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">
                    {item.is_category ? item.part_categories?.name || 'Unknown Category' : item.parts?.name || 'Unknown Item'}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-slate-600 font-medium">{Number(item.quantity) || 1}</td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-1 items-end shrink-0">
          <div className="flex justify-between w-64 text-slate-600">
            <span>Regular Value:</span>
            <span className="font-medium flex items-center gap-2">
              ₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {hasCategoryParts && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1 rounded">+ Variable</span>}
            </span>
          </div>
          <div className="flex justify-between w-64 text-slate-900 font-bold text-lg border-t border-slate-200 pt-1 mt-1">
            <span>Package Price:</span>
            <span>₱{Number(pkg.package_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
"""
# Use regex to replace the inner body of ItemsModal
new_content = re.sub(
    r"  const items = pkg\.package_items \|\| \[\](.*?)return createPortal\(.*?document\.body\n  \)\n\}",
    replacement,
    content,
    flags=re.DOTALL
)

# Fix fetchPackages query
new_content = new_content.replace(
    ".select('*, package_items(item_type, quantity, labor_services(rate, name), parts(selling_price, name, part_number))', { count: 'exact' })",
    ".select('*, package_items(item_type, is_category, quantity, labor_services(rate, name), parts(selling_price, name, part_number), part_categories(name))', { count: 'exact' })"
)

# Fix regularValue calculation in PackagesListPage
calc_replacement = """
                      let regularValue = 0;
                      let hasCategoryParts = false;
                      items.forEach((item: any) => {
                        if (item.item_type === 'PART' && item.is_category) {
                          hasCategoryParts = true;
                          return;
                        }
                        const isLabor = item.item_type === 'LABOR'
                        const sellingPrice = isLabor ? Number(item.labor_services?.rate) || 0 : Number(item.parts?.selling_price) || 0
                        const qty = Number(item.quantity) || 1
                        regularValue += (sellingPrice * qty)
                      })
                      
                      const pkgPrice = Number(pkg.package_price) || 0
"""
new_content = re.sub(
    r"                      let regularValue = 0;\n                      items\.forEach\(\(item: any\) => \{.*?const pkgPrice = Number\(pkg\.package_price\) \|\| 0",
    calc_replacement,
    new_content,
    flags=re.DOTALL
)

# Update Regular Value column in list to show + Variable
list_col_replacement = """
                          <td className="px-6 py-4 text-right text-slate-500 font-medium">
                            <div className="flex flex-col items-end">
                              <span>₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              {hasCategoryParts && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded mt-0.5 border border-amber-100">+ Variable</span>}
                            </div>
                          </td>
"""
new_content = re.sub(
    r"                          <td className=\"px-6 py-4 text-right text-slate-500 font-medium\">\n                            ₱\{regularValue\.toLocaleString.*?\}\n                          </td>",
    list_col_replacement,
    new_content,
    flags=re.DOTALL
)

with open('src/app/(dashboard)/packages/page.tsx', 'w') as f:
    f.write(new_content)
