const fs = require('fs');

function formatTables(filePath, isPrint = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to replace the entire Items section.
  // Look for the div containing "Billing Details"
  
  // Find where it starts
  const startStr = isPrint 
    ? '{/* Items Table */}'
    : '{/* Items */}';
  
  // Find where it ends
  const endStr = isPrint
    ? '{/* Totals */}'
    : '{/* Totals & Notes */}';

  const startIndex = content.indexOf(startStr);
  const endIndex = content.indexOf(endStr);

  if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start/end for", filePath);
    return;
  }

  const logicStr = `
          {(() => {
            const sortedItems = [...(inv.invoice_items || [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
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
                  <div className="mb-4">
                    <h3 className="${isPrint ? 'text-sm font-black' : 'text-sm font-bold'} text-slate-800 uppercase tracking-widest mb-1 ${isPrint ? 'mt-4' : ''}">PACKAGES</h3>
                    <div className="${isPrint ? 'border-t-2 border-slate-800' : 'border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden'}">
                      <table className="w-full text-left text-sm">
                        <thead className="${isPrint ? 'border-b border-slate-200 text-slate-500 font-bold text-[10px]' : 'bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs'} uppercase tracking-wider">
                          <tr>
                            <th className="${isPrint ? 'py-0 pr-2' : 'py-2 px-4'} w-[55%]">Description</th>
                            <th className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-center w-[10%]">Qty</th>
                            <th className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-right w-[15%]">Unit Price</th>
                            <th className="${isPrint ? 'py-0 pl-2' : 'py-2 px-4'} text-right w-[20%]">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {packages.map((item: any) => (
                            <tr key={item.id} className="${isPrint ? '' : 'hover:bg-slate-50'}">
                              <td className="${isPrint ? 'py-0 pr-2' : 'py-2 px-4'} text-slate-800 font-normal">{item.description}</td>
                              <td className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-center text-slate-600 align-top">{item.quantity}</td>
                              <td className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-right text-slate-600 align-top">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                              <td className="${isPrint ? 'py-0 pl-2' : 'py-2 px-4'} text-right font-medium text-slate-800 align-top">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* LABOR & SERVICES */}
                {laborItems.length > 0 && (
                  <div className="mb-4">
                    <h3 className="${isPrint ? 'text-sm font-black' : 'text-sm font-bold'} text-slate-800 uppercase tracking-widest mb-1 ${isPrint ? 'mt-4' : ''}">LABOR & SERVICES</h3>
                    <div className="${isPrint ? 'border-t-2 border-slate-800' : 'border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden'}">
                      <table className="w-full text-left text-sm">
                        <thead className="${isPrint ? 'border-b border-slate-200 text-slate-500 font-bold text-[10px]' : 'bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs'} uppercase tracking-wider">
                          <tr>
                            <th className="${isPrint ? 'py-0 pr-2' : 'py-2 px-4'} w-[55%]">Description</th>
                            <th className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-center w-[10%]">Qty</th>
                            <th className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-right w-[15%]">Unit Price</th>
                            <th className="${isPrint ? 'py-0 pl-2' : 'py-2 px-4'} text-right w-[20%]">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {laborItems.map((item: any) => {
                            if (item.is_section_header) {
                              return (
                                <tr key={item.id} className="bg-slate-50/50">
                                  <td colSpan={4} className="${isPrint ? 'py-0 px-1 text-[10px]' : 'py-2 px-4 text-xs'} font-bold text-slate-800 uppercase tracking-wider">
                                    {item.description}
                                  </td>
                                </tr>
                              )
                            }
                            return (
                              <tr key={item.id} className="${isPrint ? '' : 'hover:bg-slate-50'}">
                                <td className="${isPrint ? 'py-0 pr-2' : 'py-2 px-4'} text-slate-800 font-normal">{item.description}</td>
                                <td className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-center text-slate-600 align-top">{item.quantity}</td>
                                <td className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-right text-slate-600 align-top">
                                  {!!item.parent_item_id ? (
                                    <span className="text-slate-500 italic text-[11px]">Included</span>
                                  ) : (
                                    \`₱\${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}\`
                                  )}
                                </td>
                                <td className="${isPrint ? 'py-0 pl-2' : 'py-2 px-4'} text-right font-medium text-slate-800 align-top">
                                  {!!item.parent_item_id ? (
                                    <span className="text-slate-500 italic text-[11px]">—</span>
                                  ) : (
                                    \`₱\${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}\`
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PARTS & MATERIALS */}
                {partItems.length > 0 && (
                  <div className="mb-4">
                    <h3 className="${isPrint ? 'text-sm font-black' : 'text-sm font-bold'} text-slate-800 uppercase tracking-widest mb-1 ${isPrint ? 'mt-4' : ''}">PARTS & MATERIALS</h3>
                    <div className="${isPrint ? 'border-t-2 border-slate-800' : 'border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden'}">
                      <table className="w-full text-left text-sm">
                        <thead className="${isPrint ? 'border-b border-slate-200 text-slate-500 font-bold text-[10px]' : 'bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs'} uppercase tracking-wider">
                          <tr>
                            <th className="${isPrint ? 'py-0 pr-2' : 'py-2 px-4'} w-[55%]">Description</th>
                            <th className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-center w-[10%]">Qty</th>
                            <th className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-right w-[15%]">Unit Price</th>
                            <th className="${isPrint ? 'py-0 pl-2' : 'py-2 px-4'} text-right w-[20%]">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {partItems.map((item: any) => {
                            if (item.is_section_header) {
                              return (
                                <tr key={item.id} className="bg-slate-50/50">
                                  <td colSpan={4} className="${isPrint ? 'py-0 px-1 text-[10px]' : 'py-2 px-4 text-xs'} font-bold text-slate-800 uppercase tracking-wider">
                                    {item.description}
                                  </td>
                                </tr>
                              )
                            }
                            return (
                              <tr key={item.id} className="${isPrint ? '' : 'hover:bg-slate-50'}">
                                <td className="${isPrint ? 'py-0 pr-2' : 'py-2 px-4'} text-slate-800 font-normal">{item.description}</td>
                                <td className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-center text-slate-600 align-top">{item.quantity}</td>
                                <td className="${isPrint ? 'py-0 px-2' : 'py-2 px-4'} text-right text-slate-600 align-top">
                                  {!!item.parent_item_id ? (
                                    <span className="text-slate-500 italic text-[11px]">Included</span>
                                  ) : (
                                    \`₱\${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}\`
                                  )}
                                </td>
                                <td className="${isPrint ? 'py-0 pl-2' : 'py-2 px-4'} text-right font-medium text-slate-800 align-top">
                                  {!!item.parent_item_id ? (
                                    <span className="text-slate-500 italic text-[11px]">—</span>
                                  ) : (
                                    \`₱\${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}\`
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )
          })()}
`;

  let wrapperStart = isPrint 
    ? `      {/* Items Table */}\n      <div className="px-8 pt-3 pb-1">\n`
    : `      {/* Items */}\n      <div className="mb-6">\n`;

  let replacement = wrapperStart + logicStr + '      </div>\n\n      ';
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

  fs.writeFileSync(filePath, content);
}

formatTables('src/app/(dashboard)/invoice/[id]/page.tsx', false);
formatTables('src/app/(dashboard)/invoice/[id]/print/page.tsx', true);

