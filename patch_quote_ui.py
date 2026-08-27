import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

calc_old = """  const subtotal = items.reduce((sum, item) => sum + (item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))), 0)
  const grandTotal = subtotal - (Number(discount) || 0)"""

calc_new = """  const subtotal = items.reduce((sum, item) => {
    // Only top level items contribute to subtotal
    if (item.item_type === 'PACKAGE_ITEM') return sum;
    return sum + (item.is_section_header ? 0 : ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)))
  }, 0)
  const grandTotal = subtotal - (Number(discount) || 0)"""

content = content.replace(calc_old, calc_new)

# Add Package Combobox alongside Labor
comboboxes_old = """        <div className="mb-4">
          <SearchableCombobox
            options={laborServices.map(s => ({
              id: s.id,
              name: s.name,
              subtext: `${s.labor_groups?.name || 'No Group'} • ${s.labor_categories?.name || 'No Category'} • ₱${s.rate?.toLocaleString() || '0'}`
            }))}
            value=""
            onChange={(laborId) => {
              const service = laborServices.find(s => s.id === laborId)
              if (service) {
                // Check for duplicates
                const alreadyAdded = items.some(i => i.labor_service_id === service.id)
                if (alreadyAdded) {
                  setError(`"${service.name}" is already added to this quotation.`)
                  setTimeout(() => setError(null), 3000)
                  return
                }
                setItems(prev => [...prev, {
                  id: Math.random().toString(36).substr(2, 9),
                  description: service.name,
                  quantity: 1,
                  unit_price: service.rate ?? '',
                  is_section_header: false,
                  labor_service_id: service.id,
                  group_id: service.group_id,
                  category_id: service.category_id,
                  group_name_snapshot: service.labor_groups?.name,
                  category_name_snapshot: service.labor_categories?.name,
                  standard_hour_snapshot: service.standard_hours,
                }])
              }
            }}
            placeholder="Search labor / service to add..."
            searchPlaceholder="Search by service, group, or category..."
            onAddNew={(query) => {
              setNewLaborSearchQuery(query)
              setActiveItemIndexForModal(null)
              setIsNewLaborModalOpen(true)
            }}
            addNewLabel="+ Add New Labor"
          />
        </div>"""

comboboxes_new = """        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <SearchableCombobox
            options={laborServices.map(s => ({
              id: s.id,
              name: s.name,
              subtext: `${s.labor_groups?.name || 'No Group'} • ${s.labor_categories?.name || 'No Category'} • ₱${s.rate?.toLocaleString() || '0'}`
            }))}
            value=""
            onChange={(laborId) => {
              const service = laborServices.find(s => s.id === laborId)
              if (service) {
                const alreadyAdded = items.some(i => i.labor_service_id === service.id)
                if (alreadyAdded) {
                  setError(`"${service.name}" is already added to this quotation.`)
                  setTimeout(() => setError(null), 3000)
                  return
                }
                setItems(prev => [...prev, {
                  id: Math.random().toString(36).substr(2, 9),
                  item_type: 'MANUAL',
                  description: service.name,
                  quantity: 1,
                  unit_price: service.rate ?? '',
                  is_section_header: false,
                  labor_service_id: service.id,
                  group_id: service.group_id,
                  category_id: service.category_id,
                  group_name_snapshot: service.labor_groups?.name,
                  category_name_snapshot: service.labor_categories?.name,
                  standard_hour_snapshot: service.standard_hours,
                }])
              }
            }}
            placeholder="Search labor / service to add..."
            searchPlaceholder="Search by service, group, or category..."
            onAddNew={(query) => {
              setNewLaborSearchQuery(query)
              setActiveItemIndexForModal(null)
              setIsNewLaborModalOpen(true)
            }}
            addNewLabel="+ Add New Labor"
          />
          
          <SearchableCombobox
            options={packages.map(p => ({
              id: p.id,
              name: p.name,
              subtext: `${p.category || 'No Category'} • ${p.package_items?.length || 0} items • ₱${p.package_price?.toLocaleString() || '0'}`
            }))}
            value=""
            onChange={(pkgId) => {
              const pkg = packages.find(p => p.id === pkgId)
              if (pkg) {
                const newItem: LineItem = {
                  id: Math.random().toString(36).substr(2, 9),
                  item_type: 'PACKAGE',
                  package_id: pkg.id,
                  description: pkg.name,
                  quantity: 1,
                  unit_price: pkg.package_price,
                  is_section_header: false,
                  package_items: (pkg.package_items || []).map((pi: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
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
            }}
            placeholder="Search package to add..."
            searchPlaceholder="Search packages by name or category..."
          />
        </div>"""

content = content.replace(comboboxes_old, comboboxes_new)

# Modify item rendering to support PACKAGE items
render_old = """            <div key={item.id} className={`flex gap-3 items-center ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2' : 'py-1'}`}>
              <div className="flex-1">
                {item.is_section_header ? (
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g. LABOR CHARGES"
                    className="w-full border border-slate-300 rounded-md p-2 font-bold bg-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description..."
                    className={`w-full border border-slate-300 rounded-md p-2 ${item.labor_service_id ? 'bg-blue-50 font-medium text-blue-900' : ''}`}
                  />
                )}
              </div>

              {!item.is_section_header && (
                <>
                  <div className="w-24">
                    <input
                      type="number"
                      min="0.1" step="0.1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full border border-slate-300 rounded-md p-2 text-center"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0" step="0.01"
                      value={item.unit_price}
                      onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                      placeholder="Price"
                      className="w-full border border-slate-300 rounded-md p-2 text-right"
                    />
                  </div>
                  <div className="w-32 text-right font-medium text-slate-800 pr-2">
                    ₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </>
              )}
              {item.is_section_header && (
                <div className="w-[304px]"></div>
              )}
              <div className="w-10 text-center flex items-center justify-center">
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>"""

render_new = """            <div key={item.id} className={`flex flex-col gap-2 ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2' : item.item_type === 'PACKAGE' ? 'bg-blue-50/30 border border-blue-100 p-3 rounded-md' : 'py-1'}`}>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  {item.is_section_header ? (
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="e.g. LABOR CHARGES"
                      className="w-full border border-slate-300 rounded-md p-2 font-bold bg-transparent"
                    />
                  ) : item.item_type === 'PACKAGE' ? (
                    <div className="w-full border border-blue-200 rounded-md p-2 font-bold bg-blue-50 text-blue-900 flex justify-between items-center">
                      <span>{item.description}</span>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wide">Package</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description..."
                      className={`w-full border border-slate-300 rounded-md p-2 ${item.labor_service_id ? 'bg-blue-50 font-medium text-blue-900' : ''}`}
                    />
                  )}
                </div>

                {!item.is_section_header && (
                  <>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0.1" step="0.1"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-full border border-slate-300 rounded-md p-2 text-center"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        min="0" step="0.01"
                        value={item.unit_price}
                        onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                        placeholder="Price"
                        className="w-full border border-slate-300 rounded-md p-2 text-right"
                        disabled={item.item_type === 'PACKAGE'}
                      />
                    </div>
                    <div className="w-32 text-right font-medium text-slate-800 pr-2">
                      ₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </>
                )}
                {item.is_section_header && (
                  <div className="w-[304px]"></div>
                )}
                <div className="w-10 text-center flex items-center justify-center">
                  <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Package Items details */}
              {item.item_type === 'PACKAGE' && item.package_items && item.package_items.length > 0 && (
                <div className="mt-2 pl-4 space-y-1">
                  {item.package_items.map(child => (
                    <div key={child.id} className="flex gap-3 text-sm items-center py-1.5 border-t border-blue-100">
                      <div className="flex-1 flex items-center gap-2">
                        {child.is_category ? (
                          <>
                            <span className="text-amber-600 font-bold flex items-center gap-1">⚠ {child.description}</span>
                            <button 
                              type="button" 
                              onClick={() => setResolvePartInfo({ parentItemId: item.id, childItemId: child.id, categoryId: child.part_category_id || '' })}
                              className={`px-3 py-1 rounded text-xs font-bold border transition ${child.resolved_part_id ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 shadow-sm'}`}
                            >
                              {child.resolved_part_id ? `Selected: ${child.resolved_part_name || 'Item'}` : 'Select Part'}
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-700 font-medium">{child.description}</span>
                        )}
                      </div>
                      <div className="w-24 text-center text-slate-500">Qty: {child.quantity}</div>
                      <div className="w-32 text-right text-slate-400">—</div>
                      <div className="w-32 text-right text-slate-400">—</div>
                      <div className="w-10"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>"""

content = content.replace(render_old, render_new)
with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
