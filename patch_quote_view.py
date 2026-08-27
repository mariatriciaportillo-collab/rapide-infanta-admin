import re

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'r') as f:
    content = f.read()

view_old = """          <div className="space-y-1">
            {items.map((item: any) => (
              <div key={item.id} className={`flex gap-3 items-center ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2 mt-4' : 'py-2 border-b border-slate-50 last:border-0'}`}>
                <div className="flex-1">
                  <div className={`text-sm ${item.is_section_header ? 'font-bold text-slate-800 uppercase tracking-wider' : 'font-medium text-slate-800'}`}>
                    {item.description}
                  </div>
                  {item.labor_service_id && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.group_name_snapshot || 'No Group'} • {item.category_name_snapshot || 'No Category'}
                    </div>
                  )}
                </div>
                {!item.is_section_header && (
                  <>
                    <div className="w-24 text-center text-sm font-medium text-slate-700">
                      {item.quantity}
                    </div>
                    <div className="w-32 text-right text-sm text-slate-600">
                      ₱{Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="w-32 text-right text-sm font-bold text-slate-800">
                      ₱{Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>"""

view_new = """          <div className="space-y-1">
            {items.filter((i: any) => !i.parent_item_id).map((item: any) => (
              <div key={item.id} className={`flex flex-col gap-2 ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2 mt-4' : item.item_type === 'PACKAGE' ? 'bg-blue-50/20 border border-blue-100 p-3 rounded-md mb-2' : 'py-2 border-b border-slate-50 last:border-0'}`}>
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <div className={`text-sm ${item.is_section_header ? 'font-bold text-slate-800 uppercase tracking-wider' : 'font-medium text-slate-800'}`}>
                      {item.description} {item.item_type === 'PACKAGE' && <span className="ml-2 text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase font-bold tracking-wide">Package</span>}
                    </div>
                    {item.labor_service_id && !item.is_section_header && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.group_name_snapshot || 'No Group'} • {item.category_name_snapshot || 'No Category'}
                      </div>
                    )}
                  </div>
                  {!item.is_section_header && (
                    <>
                      <div className="w-24 text-center text-sm font-medium text-slate-700">
                        {item.quantity}
                      </div>
                      <div className="w-32 text-right text-sm text-slate-600">
                        ₱{Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="w-32 text-right text-sm font-bold text-slate-800">
                        ₱{Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Render Package Children */}
                {item.item_type === 'PACKAGE' && (
                  <div className="mt-1 pl-4 space-y-1">
                    {items.filter((child: any) => child.parent_item_id === item.id).map((child: any) => (
                      <div key={child.id} className="flex gap-3 items-center py-1 border-t border-blue-50 text-xs">
                        <div className="flex-1 text-slate-600 flex items-center gap-1">
                          {child.is_category ? (
                            <>
                              <span className="text-amber-600 font-bold">⚠ {child.description}</span>
                              {child.resolved_part_id && <span className="bg-emerald-100 text-emerald-800 px-1.5 rounded ml-1">Resolved</span>}
                            </>
                          ) : (
                            <span>{child.description}</span>
                          )}
                        </div>
                        <div className="w-24 text-center text-slate-400">Qty: {child.quantity}</div>
                        <div className="w-32"></div>
                        <div className="w-32"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>"""

content = content.replace(view_old, view_new)

with open('src/app/(dashboard)/quotations/[id]/page.tsx', 'w') as f:
    f.write(content)
