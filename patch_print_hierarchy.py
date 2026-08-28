import re

with open('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'r') as f:
    content = f.read()

pattern = r"      \{\/\* Items Table \*\/\}[\s\S]*?      \{\/\* Totals \*\/\}"

replacement = """      {/* Items Table */}
      <div className="px-6 pt-4 pb-2 space-y-4">
        {(() => {
          const sortedItems = [...items].sort((a: any, b: any) => a.sort_order - b.sort_order);
          const isPkg = (i: any) => i.item_type === 'PACKAGE' || (!i.parent_item_id && i.package_id);
          const isPrt = (i: any) => i.item_type === 'PART' || (!i.parent_item_id && i.part_id && !i.package_id) || (i.parent_item_id && (i.part_id || i.is_category));
          const isLbr = (i: any) => !isPkg(i) && !isPrt(i);

          const packages = sortedItems.filter(isPkg);
          const partItems = sortedItems.filter(isPrt);
          const laborItems = sortedItems.filter(isLbr);

          return (
            <>
              {/* PACKAGES */}
              {packages.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">PACKAGES</h3>
                  <table className="w-full text-left text-sm border-t-2 border-slate-800">
                    <thead className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-1 pr-2 w-[55%]">Description</th>
                        <th className="py-1 px-2 text-center w-[10%]">Qty</th>
                        <th className="py-1 px-2 text-right w-[15%]">Unit Price</th>
                        <th className="py-1 pl-2 text-right w-[20%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packages.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-1 pr-2 text-slate-800 font-normal">{item.description}</td>
                          <td className="py-1 px-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-1 px-2 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="py-1 pl-2 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LABOR & SERVICES */}
              {laborItems.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">LABOR & SERVICES</h3>
                  <table className="w-full text-left text-sm border-t-2 border-slate-800">
                    <thead className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-1 pr-2 w-[55%]">Description</th>
                        <th className="py-1 px-2 text-center w-[10%]">Qty</th>
                        <th className="py-1 px-2 text-right w-[15%]">Unit Price</th>
                        <th className="py-1 pl-2 text-right w-[20%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {laborItems.map((item: any) => {
                        if (item.is_section_header) {
                          return (
                            <tr key={item.id} className="bg-slate-50/50">
                              <td colSpan={4} className="py-1 px-1 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                                {item.description}
                              </td>
                            </tr>
                          )
                        }
                        return (
                          <tr key={item.id}>
                            <td className="py-1 pr-2 text-slate-800 font-normal">{item.description}</td>
                            <td className="py-1 px-2 text-center text-slate-600 align-top">{item.quantity}</td>
                            <td className="py-1 px-2 text-right text-slate-600 align-top">
                              {!!item.parent_item_id ? (
                                <span className="text-slate-500 italic text-[11px]">Included</span>
                              ) : (
                                `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                              )}
                            </td>
                            <td className="py-1 pl-2 text-right font-medium text-slate-800 align-top">
                              {!!item.parent_item_id ? (
                                <span className="text-slate-500 italic text-[11px]">—</span>
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

              {/* PARTS & MATERIALS */}
              {partItems.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">PARTS & MATERIALS</h3>
                  <table className="w-full text-left text-sm border-t-2 border-slate-800">
                    <thead className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-1 pr-2 w-[55%]">Description</th>
                        <th className="py-1 px-2 text-center w-[10%]">Qty</th>
                        <th className="py-1 px-2 text-right w-[15%]">Unit Price</th>
                        <th className="py-1 pl-2 text-right w-[20%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partItems.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-1 pr-2 text-slate-800 font-normal">{item.description}</td>
                          <td className="py-1 px-2 text-center text-slate-600 align-top">{item.quantity}</td>
                          <td className="py-1 px-2 text-right text-slate-600 align-top">
                            {!!item.parent_item_id ? (
                              <span className="text-slate-500 italic text-[11px]">Included</span>
                            ) : (
                              `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                            )}
                          </td>
                          <td className="py-1 pl-2 text-right font-medium text-slate-800 align-top">
                            {!!item.parent_item_id ? (
                              <span className="text-slate-500 italic text-[11px]">—</span>
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
      </div>

      {/* Totals */}"""

content = re.sub(pattern, replacement, content)

with open('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'w') as f:
    f.write(content)
