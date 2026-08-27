import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Replace the entire UI block
pattern = r"      \{\/\* Line Items \*\/\}[\s\S]*?\{\/\* Footer \/ Totals \*\/\}|" + r"      \{\/\* LINE ITEMS \*\/\}[\s\S]*?\{\/\* Footer \/ Totals \*\/\}"

replacement = """      {/* SECTION 1: PACKAGES */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Packages</h3>
        </div>
        
        <div className="mb-4">
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
        </div>

        <div className="space-y-4">
          {items.filter(i => i.item_type === 'PACKAGE').map((item, index) => (
            <div key={item.id} className="bg-slate-50 border border-slate-200 p-4 rounded-md">
              <div className="flex gap-3 items-center mb-3">
                <div className="flex-1 font-bold text-blue-900 text-lg flex items-center gap-2">
                  {item.description}
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wide">Package</span>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 text-center">Qty</label>
                  <input
                    type="number"
                    min="1" step="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-center"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 text-right">Package Price</label>
                  <input
                    type="number"
                    min="0" step="0.01"
                    value={item.unit_price}
                    onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 text-right bg-white"
                    disabled
                  />
                </div>
                <div className="w-32 text-right pr-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Amount</label>
                  <span className="font-bold text-slate-800 text-lg">
                    ₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-10 text-center flex items-center justify-center mt-5">
                  <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Package Items details */}
              {item.package_items && item.package_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Labor & Services Included</h4>
                    <div className="space-y-1">
                      {item.package_items.filter(child => child.labor_service_id).map(child => (
                        <div key={child.id} className="text-sm flex gap-2 items-center text-slate-600 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                          <span className="flex-1">{child.description}</span>
                        </div>
                      ))}
                      {item.package_items.filter(child => child.labor_service_id).length === 0 && (
                        <div className="text-sm text-slate-400 italic">No labor included.</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Parts & Materials Included</h4>
                    <div className="space-y-1">
                      {item.package_items.filter(child => child.part_id || child.is_category).map(child => (
                        <div key={child.id} className="text-sm flex gap-2 items-center text-slate-600 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                          <div className="flex-1 flex items-center gap-2">
                            {child.is_category ? (
                              <>
                                <span className="text-amber-600 font-bold flex items-center gap-1">⚠ {child.description}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setResolvePartInfo({ parentItemId: item.id, childItemId: child.id, categoryId: child.part_category_id || '' })}
                                  className={`px-2 py-0.5 rounded text-xs font-bold border transition ${child.resolved_part_id ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 shadow-sm'}`}
                                >
                                  {child.resolved_part_id ? `Selected: ${child.resolved_part_name || 'Item'}` : 'Select Part'}
                                </button>
                              </>
                            ) : (
                              <span className="font-medium">{child.description}</span>
                            )}
                          </div>
                          <span className="text-slate-400 text-xs shrink-0">Qty: {child.quantity}</span>
                        </div>
                      ))}
                      {item.package_items.filter(child => child.part_id || child.is_category).length === 0 && (
                        <div className="text-sm text-slate-400 italic">No parts included.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.filter(i => i.item_type === 'PACKAGE').length === 0 && (
            <p className="text-center text-slate-400 py-4">No packages added.</p>
          )}
        </div>
      </div>

      {/* SECTION 2: LABOR & SERVICES */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Labor & Services</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => addItem(false, 'MANUAL')} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition">
              + Add Manual Labor
            </button>
            <button type="button" onClick={() => addItem(true, 'MANUAL')} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium transition">
              + Add Section Header
            </button>
          </div>
        </div>
        
        <div className="mb-4">
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
                  item_type: 'LABOR',
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
        </div>

        <div className="space-y-2">
          {items.filter(i => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR').map((item, index) => (
            <div key={item.id} className={`flex gap-3 items-center ${item.is_section_header ? 'bg-slate-50 p-2 rounded -mx-2' : 'py-1'}`}>
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
                    placeholder="Labor description..."
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
            </div>
          ))}
          {items.filter(i => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR').length === 0 && (
            <p className="text-center text-slate-400 py-4">No labor added.</p>
          )}
        </div>
      </div>

      {/* SECTION 3: PARTS & MATERIALS */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-slate-800">Parts & Materials</h3>
        </div>
        
        <div className="mb-4">
          <PartSearchSelector 
            selectedPartId={null}
            setSelectedPartId={() => {}}
            onSelectPart={(part) => {
              if (part) {
                const alreadyAdded = items.some(i => i.part_id === part.id && i.item_type === 'PART')
                if (alreadyAdded) {
                  setError(`"${part.name}" is already added to this quotation.`)
                  setTimeout(() => setError(null), 3000)
                  return
                }
                setItems(prev => [...prev, {
                  id: Math.random().toString(36).substr(2, 9),
                  item_type: 'PART',
                  description: part.name,
                  quantity: 1,
                  unit_price: part.selling_price ?? 0,
                  is_section_header: false,
                  part_id: part.id,
                }])
              }
            }}
          />
        </div>

        <div className="space-y-2">
          {items.filter(i => i.item_type === 'PART').map((item, index) => (
            <div key={item.id} className="flex gap-3 items-center py-1">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Part description..."
                  className="w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900"
                />
              </div>

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
              <div className="w-10 text-center flex items-center justify-center">
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {items.filter(i => i.item_type === 'PART').length === 0 && (
            <p className="text-center text-slate-400 py-4">No individual parts added.</p>
          )}
        </div>
      </div>

      {/* Footer / Totals */}"""

content = re.sub(pattern, replacement, content)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)
