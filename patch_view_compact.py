import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

pattern = r"        \{\/\* Line Items Table \*\/\}[\s\S]*?        \{\/\* Totals Section \*\/\}"

replacement = """        {/* Line Items Table */}
        <div className="p-8 pb-4">
          {(() => {
            const sortedItems = [...items].sort((a: any, b: any) => a.sort_order - b.sort_order);
            const isPkg = (i: any) => i.item_type === 'PACKAGE' || (!i.parent_item_id && i.package_id);
            const isPrt = (i: any) => i.item_type === 'PART' || (!i.parent_item_id && i.part_id && !i.package_id) || (i.parent_item_id && (i.part_id || i.is_category));
            const isLbr = (i: any) => !isPkg(i) && !isPrt(i);

            const packages = sortedItems.filter(isPkg);
            const partItems = sortedItems.filter(isPrt);
            const laborItems = sortedItems.filter(isLbr);

            return (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-white font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 w-[55%] font-semibold">Description</th>
                      <th className="py-2.5 px-4 text-center w-[10%] font-semibold">Qty</th>
                      <th className="py-2.5 px-4 text-right w-[15%] font-semibold">Unit Price</th>
                      <th className="py-2.5 px-4 text-right w-[20%] font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {/* PACKAGES */}
                    {packages.length > 0 && (
                      <>
                        <tr className="bg-slate-100/80">
                          <td colSpan={4} className="py-1.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                            Packages
                          </td>
                        </tr>
                        {packages.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-4 text-slate-800 font-bold">{item.description}</td>
                            <td className="py-2 px-4 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-2 px-4 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td className="py-2 px-4 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* LABOR & SERVICES */}
                    {laborItems.length > 0 && (
                      <>
                        <tr className="bg-slate-100/80">
                          <td colSpan={4} className="py-1.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                            Labor & Services
                          </td>
                        </tr>
                        {laborItems.map((item: any) => {
                          if (item.is_section_header) {
                            return (
                              <tr key={item.id} className="bg-slate-50">
                                <td colSpan={4} className="py-2 px-4 font-bold text-slate-800 uppercase tracking-wider text-xs">
                                  {item.description}
                                </td>
                              </tr>
                            )
                          }
                          
                          return (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-4 text-slate-800 font-medium">{item.description}</td>
                              <td className="py-2 px-4 text-center text-slate-600 align-top">{item.quantity}</td>
                              <td className="py-2 px-4 text-right text-slate-600 align-top">
                                {!!item.parent_item_id ? (
                                  <span className="text-slate-500 italic text-sm">Included</span>
                                ) : (
                                  `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                                )}
                              </td>
                              <td className="py-2 px-4 text-right font-medium text-slate-800 align-top">
                                {!!item.parent_item_id ? (
                                  <span className="text-slate-500 italic text-sm">—</span>
                                ) : (
                                  `₱${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </>
                    )}

                    {/* PARTS & MATERIALS */}
                    {partItems.length > 0 && (
                      <>
                        <tr className="bg-slate-100/80">
                          <td colSpan={4} className="py-1.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-widest">
                            Parts & Materials
                          </td>
                        </tr>
                        {partItems.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-4 text-slate-800 font-medium">{item.description}</td>
                            <td className="py-2 px-4 text-center text-slate-600 align-top">{item.quantity}</td>
                            <td className="py-2 px-4 text-right text-slate-600 align-top">
                              {!!item.parent_item_id ? (
                                <span className="text-slate-500 italic text-sm">Included</span>
                              ) : (
                                `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                              )}
                            </td>
                            <td className="py-2 px-4 text-right font-medium text-slate-800 align-top">
                              {!!item.parent_item_id ? (
                                <span className="text-slate-500 italic text-sm">—</span>
                              ) : (
                                `₱${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                              )}
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        {/* Totals Section */}"""

content = re.sub(pattern, replacement, content)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
