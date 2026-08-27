import re

with open('src/app/(dashboard)/packages/page.tsx', 'r') as f:
    content = f.read()

replacement = """
  const items = pkg.package_items || []
  
  const laborItems = items.filter((i: any) => i.item_type === 'LABOR')
  const partItems = items.filter((i: any) => i.item_type === 'PART')
  
  let packageTotal = 0;
  
  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 1
    const price = Number(item.price) || 0
    packageTotal += (price * qty)
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
                <th className="px-6 py-3 font-bold text-right">Price</th>
                <th className="px-6 py-3 font-bold text-right">Qty</th>
                <th className="px-6 py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laborItems.map((item: any, i: number) => {
                const qty = Number(item.quantity) || 1
                const price = Number(item.price) || 0
                return (
                  <tr key={`labor-${i}`} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-indigo-600 font-bold">Labor</td>
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">{item.labor_services?.name || 'Unknown Item'}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-500">₱{price.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-600 font-medium">{qty}</td>
                    <td className="px-6 py-3 text-sm text-right font-bold text-slate-800">₱{(price * qty).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  </tr>
                )
              })}
              
              {partItems.map((item: any, i: number) => {
                const qty = Number(item.quantity) || 1
                const price = Number(item.price) || 0
                return (
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
                    <td className="px-6 py-3 text-sm text-right text-slate-500">₱{price.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-600 font-medium">{qty}</td>
                    <td className="px-6 py-3 text-sm text-right font-bold text-slate-800">₱{(price * qty).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  </tr>
                )
              })}

              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col items-end shrink-0">
          <div className="flex justify-between w-64 text-slate-900 font-black text-xl">
            <span>Total:</span>
            <span>₱{packageTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
"""

new_content = re.sub(
    r"  const items = pkg\.package_items \|\| \[\](.*?)return createPortal\(.*?document\.body\n  \)\n\}",
    replacement,
    content,
    flags=re.DOTALL
)

# Fix fetchPackages query to fetch 'price'
new_content = new_content.replace(
    ".select('*, package_items(item_type, is_category, quantity, labor_services(rate, name), parts(selling_price, name, part_number), part_categories(name))', { count: 'exact' })",
    ".select('*, package_items(item_type, is_category, quantity, price, labor_services(rate, name), parts(selling_price, name, part_number), part_categories(name))', { count: 'exact' })"
)

# Fix Regular Value calculation in list logic to Package Total
list_col_replacement = """
                      let packageTotal = 0;
                      items.forEach((item: any) => {
                        const qty = Number(item.quantity) || 1
                        const price = Number(item.price) || 0
                        packageTotal += (price * qty)
                      })
                      
                      const pkgPrice = packageTotal // Since they are identical now
"""
new_content = re.sub(
    r"                      let regularValue = 0;\n.*?const pkgPrice = Number\(pkg\.package_price\) \|\| 0",
    list_col_replacement,
    new_content,
    flags=re.DOTALL
)

# Update column titles and data
list_header_replace = """                    <th className="px-6 py-3 font-medium text-right">ITEMS</th>
                    <th className="px-6 py-3 font-medium text-right">PACKAGE PRICE</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>"""
new_content = re.sub(
    r"                    <th className=\"px-6 py-3 font-medium text-right\">ITEMS</th>.*?<th className=\"px-6 py-3 font-medium\">STATUS</th>",
    list_header_replace,
    new_content,
    flags=re.DOTALL
)

list_data_replace = """                          <td className="px-6 py-4 text-right text-slate-500 font-medium">
                            <span className="font-bold text-slate-800">₱{packageTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </td>"""
new_content = re.sub(
    r"                          <td className=\"px-6 py-4 text-right text-slate-500 font-medium\">.*?<td className=\"px-6 py-4 text-right font-bold text-slate-800\">\n                            ₱\{pkgPrice\.toLocaleString.*?\}\n                          </td>",
    list_data_replace,
    new_content,
    flags=re.DOTALL
)


with open('src/app/(dashboard)/packages/page.tsx', 'w') as f:
    f.write(new_content)
