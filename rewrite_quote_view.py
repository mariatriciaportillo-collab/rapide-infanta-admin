import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

# Replace the Line Items section completely
pattern = r"        \{\/\* Line Items \*\/\}[\s\S]*?\{\/\* Totals \*\/\}|" + r"        \{\/\* SECTION 1: PACKAGES \*\/\}[\s\S]*?\{\/\* Totals \*\/\}"

replacement = """        {/* SECTION 1: PACKAGES */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Packages</h3>
          <div className="space-y-2">
            {items.filter((i: any) => i.item_type === 'PACKAGE').map((item: any) => (
              <div key={item.id} className="flex gap-3 items-center bg-blue-50/30 border border-blue-100 p-3 rounded-md">
                <div className="flex-1 font-bold text-blue-900 flex items-center gap-2">
                  {item.description}
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wide">Package</span>
                </div>
                <div className="w-24 text-center text-sm font-medium text-slate-700">Qty: {item.quantity}</div>
                <div className="w-32 text-right text-sm text-slate-600">
                  ₱{Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-32 text-right text-sm font-bold text-slate-800">
                  ₱{Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {items.filter((i: any) => i.item_type === 'PACKAGE').length === 0 && (
              <p className="text-sm text-slate-400 italic">No packages added.</p>
            )}
          </div>
        </div>

        {/* SECTION 2: LABOR & SERVICES */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Labor & Services</h3>
          <div className="space-y-1">
            {items.filter((i: any) => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id)).map((item: any) => (
              <div key={item.id} className={`flex gap-3 items-center py-2 border-b border-slate-50 last:border-0 ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2 mt-4' : ''}`}>
                <div className="flex-1">
                  <div className={`text-sm flex items-center gap-2 ${item.is_section_header ? 'font-bold text-slate-800 uppercase tracking-wider' : 'font-medium text-slate-800'}`}>
                    {item.description}
                    {item.item_type === 'PACKAGE_ITEM' && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-bold">Package Item</span>}
                  </div>
                  {item.labor_service_id && !item.is_section_header && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.group_name_snapshot || 'No Group'} • {item.category_name_snapshot || 'No Category'}
                    </div>
                  )}
                </div>
                {!item.is_section_header && (
                  <>
                    <div className="w-24 text-center text-sm font-medium text-slate-700">{item.quantity}</div>
                    <div className="w-32 text-right text-sm text-slate-600">
                      {item.item_type === 'PACKAGE_ITEM' ? (
                        <span className="italic text-slate-400">Included</span>
                      ) : (
                        `₱${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </div>
                    <div className="w-32 text-right text-sm font-bold text-slate-800">
                      {item.item_type === 'PACKAGE_ITEM' ? (
                        <span className="italic text-slate-400">₱0.00</span>
                      ) : (
                        `₱${Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {items.filter((i: any) => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id)).length === 0 && (
              <p className="text-sm text-slate-400 italic">No labor added.</p>
            )}
          </div>
        </div>

        {/* SECTION 3: PARTS & MATERIALS */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Parts & Materials</h3>
          <div className="space-y-1">
            {items.filter((i: any) => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category))).map((item: any) => (
              <div key={item.id} className="flex gap-3 items-center py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    {item.is_category && !item.resolved_part_id && <span className="text-amber-600">⚠</span>}
                    {item.description}
                    {item.item_type === 'PACKAGE_ITEM' && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold">Package Item</span>}
                  </div>
                </div>
                <div className="w-24 text-center text-sm font-medium text-slate-700">{item.quantity}</div>
                <div className="w-32 text-right text-sm text-slate-600">
                  {item.item_type === 'PACKAGE_ITEM' ? (
                    <span className="italic text-slate-400">Included</span>
                  ) : (
                    `₱${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </div>
                <div className="w-32 text-right text-sm font-bold text-slate-800">
                  {item.item_type === 'PACKAGE_ITEM' ? (
                    <span className="italic text-slate-400">₱0.00</span>
                  ) : (
                    `₱${Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </div>
              </div>
            ))}
            {items.filter((i: any) => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category))).length === 0 && (
              <p className="text-sm text-slate-400 italic">No parts added.</p>
            )}
          </div>
        </div>

        {/* Totals */}"""

# We'll use sed/awk via python replacement if simple replace works.
# Wait, let me make sure the original markers exist.
if "{/* Line Items */}" in content:
    content = re.sub(r"        \{\/\* Line Items \*\/\}[\s\S]*?\{\/\* Totals \*\/\}" , replacement, content)
else:
    # Try finding whatever was there before
    content = re.sub(r"        <div className=\"space-y-1\">\s*\{items\.filter[\s\S]*?\{\/\* Totals \*\/\}" , replacement, content)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
