import re

with open('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'r') as f:
    content = f.read()

pattern = r"      \{\/\* Items Table \*\/\}[\s\S]*?      \{\/\* Totals \*\/\}"

replacement = """      {/* Items Table */}
      <div className="px-6 pt-4 pb-2">
        {(() => {
          const sortedItems = [...items].sort((a: any, b: any) => a.sort_order - b.sort_order);
          const isPkg = (i: any) => i.item_type === 'PACKAGE' || (!i.parent_item_id && i.package_id);
          const isPrt = (i: any) => i.item_type === 'PART' || (!i.parent_item_id && i.part_id && !i.package_id) || (i.parent_item_id && (i.part_id || i.is_category));
          const isLbr = (i: any) => !isPkg(i) && !isPrt(i);

          const packages = sortedItems.filter(isPkg);
          const partItems = sortedItems.filter(isPrt);
          const laborItems = sortedItems.filter(isLbr);

          return (
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-slate-800 text-slate-800 font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 pr-2 w-[55%]">Description</th>
                  <th className="py-2 px-2 text-center w-[10%]">Qty</th>
                  <th className="py-2 px-2 text-right w-[15%]">Unit Price</th>
                  <th className="py-2 pl-2 text-right w-[20%]">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* PACKAGES */}
                {packages.length > 0 && (
                  <>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={4} className="py-1 px-1 text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                        Packages
                      </td>
                    </tr>
                    {packages.map((item: any) => (
                      <tr key={item.id} className="page-break-inside-avoid">
                        <td className="py-1 pr-2 text-slate-800 font-bold">{item.description}</td>
                        <td className="py-1 px-2 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-1 px-2 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="py-1 pl-2 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </>
                )}

                {/* LABOR & SERVICES */}
                {laborItems.length > 0 && (
                  <>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={4} className="py-1 px-1 text-[10px] font-bold text-slate-800 uppercase tracking-widest mt-1">
                        Labor & Services
                      </td>
                    </tr>
                    {laborItems.map((item: any) => {
                      if (item.is_section_header) {
                        return (
                          <tr key={item.id} className="bg-slate-50/50 page-break-inside-avoid">
                            <td colSpan={4} className="py-1 px-1 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                              {item.description}
                            </td>
                          </tr>
                        )
                      }
                      return (
                        <tr key={item.id} className="page-break-inside-avoid">
                          <td className="py-1 pr-2 text-slate-800 font-medium">{item.description}</td>
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
                  </>
                )}

                {/* PARTS & MATERIALS */}
                {partItems.length > 0 && (
                  <>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={4} className="py-1 px-1 text-[10px] font-bold text-slate-800 uppercase tracking-widest mt-1">
                        Parts & Materials
                      </td>
                    </tr>
                    {partItems.map((item: any) => (
                      <tr key={item.id} className="page-break-inside-avoid">
                        <td className="py-1 pr-2 text-slate-800 font-medium">{item.description}</td>
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
                  </>
                )}
              </tbody>
            </table>
          );
        })()}
      </div>

      {/* Totals */}"""

content = re.sub(pattern, replacement, content)

with open('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'w') as f:
    f.write(content)
