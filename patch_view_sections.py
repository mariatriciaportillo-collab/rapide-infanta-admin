import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

# We replace from SECTION 1: PACKAGES up to {/* Totals */}
pattern = r"        \{\/\* SECTION 1: PACKAGES \*\/\}[\s\S]*?        \{\/\* Totals \*\/\}"

replacement = """        {/* SECTION 1: PACKAGES */}
        {(() => {
          const sortedItems = [...items].sort((a: any, b: any) => a.sort_order - b.sort_order);
          const packages = sortedItems.filter((i: any) => i.item_type === 'PACKAGE');
          const laborItems = sortedItems.filter((i: any) => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id));
          const partItems = sortedItems.filter((i: any) => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category)));

          const getParentPackageName = (parentId: string) => {
            return sortedItems.find((p: any) => p.id === parentId)?.description || 'Package';
          };

          return (
            <>
              {packages.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b pb-2 mb-4">Packages</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                      <tr>
                        <th className="pb-2 w-3/5 font-normal">Description</th>
                        <th className="pb-2 text-center w-1/12 font-normal">Qty</th>
                        <th className="pb-2 text-right w-1/6 font-normal">Unit Price</th>
                        <th className="pb-2 text-right w-1/6 font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {packages.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 pr-4 text-slate-800 font-bold">{item.description}</td>
                          <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-3 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="py-3 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {laborItems.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b pb-2 mb-4">Labor & Services</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                      <tr>
                        <th className="pb-2 w-3/5 font-normal">Description</th>
                        <th className="pb-2 text-center w-1/12 font-normal">Qty</th>
                        <th className="pb-2 text-right w-1/6 font-normal">Unit Price</th>
                        <th className="pb-2 text-right w-1/6 font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {laborItems.map((item: any) => {
                        if (item.is_section_header) {
                          return (
                            <tr key={item.id} className="bg-slate-50/80">
                              <td colSpan={4} className="py-3 px-2 font-bold text-slate-800 uppercase tracking-wider text-xs">
                                {item.description}
                              </td>
                            </tr>
                          )
                        }
                        
                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 pr-4">
                              <div className="text-slate-800 font-medium">{item.description}</div>
                              {item.item_type === 'PACKAGE_ITEM' && (
                                <div className="text-xs text-slate-500 italic mt-0.5">
                                  Included in: {getParentPackageName(item.parent_item_id)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 text-center text-slate-600 align-top">{item.quantity}</td>
                            <td className="py-3 text-right text-slate-600 align-top">
                              {item.item_type === 'PACKAGE_ITEM' ? (
                                <span className="text-slate-400 italic text-sm font-medium">Included in Package</span>
                              ) : (
                                `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                              )}
                            </td>
                            <td className="py-3 text-right font-medium text-slate-800 align-top">
                              {item.item_type === 'PACKAGE_ITEM' ? (
                                <span className="text-slate-400 italic text-sm">—</span>
                              ) : (
                                `₱${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {partItems.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b pb-2 mb-4">Parts & Materials</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                      <tr>
                        <th className="pb-2 w-3/5 font-normal">Description</th>
                        <th className="pb-2 text-center w-1/12 font-normal">Qty</th>
                        <th className="pb-2 text-right w-1/6 font-normal">Unit Price</th>
                        <th className="pb-2 text-right w-1/6 font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {partItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 pr-4">
                            <div className="text-slate-800 font-medium">
                              {item.is_category && !item.resolved_part_id && <span className="text-amber-600 mr-2">⚠</span>}
                              {item.description}
                            </div>
                            {item.item_type === 'PACKAGE_ITEM' && (
                              <div className="text-xs text-slate-500 italic mt-0.5">
                                Included in: {getParentPackageName(item.parent_item_id)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-center text-slate-600 align-top">{item.quantity}</td>
                          <td className="py-3 text-right text-slate-600 align-top">
                            {item.item_type === 'PACKAGE_ITEM' ? (
                              <span className="text-slate-400 italic text-sm font-medium">Included in Package</span>
                            ) : (
                              `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                            )}
                          </td>
                          <td className="py-3 text-right font-medium text-slate-800 align-top">
                            {item.item_type === 'PACKAGE_ITEM' ? (
                              <span className="text-slate-400 italic text-sm">—</span>
                            ) : (
                              `₱${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          );
        })()}

        {/* Totals */}"""

content = re.sub(pattern, replacement, content)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
