import re

with open('src/components/quotations/QuotationForm.tsx', 'r') as f:
    content = f.read()

# Modify Section 1: Packages Render
section1_old = """        <div className="space-y-4">
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
        </div>"""

section1_new = """        <div className="space-y-2">
          {items.filter(i => i.item_type === 'PACKAGE').map((item, index) => (
            <div key={item.id} className="bg-slate-50 border border-slate-200 p-3 rounded-md flex gap-3 items-center">
              <div className="flex-1 font-bold text-blue-900 text-lg flex items-center gap-2">
                {item.description}
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wide">Package</span>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min="1" step="1"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-center"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="0" step="0.01"
                  value={item.unit_price}
                  onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-right bg-white"
                />
              </div>
              <div className="w-32 text-right pr-2">
                <span className="font-bold text-slate-800 text-lg">
                  ₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-10 text-center flex items-center justify-center">
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {items.filter(i => i.item_type === 'PACKAGE').length === 0 && (
            <p className="text-center text-slate-400 py-4">No packages added.</p>
          )}
        </div>"""

content = content.replace(section1_old, section1_new)

# Modify Section 2: Labor Render filter
section2_filter_old = "items.filter(i => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR')"
section2_filter_new = "items.filter(i => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id))"
content = content.replace(section2_filter_old, section2_filter_new)

# Section 2: Row Rendering update to handle package laber
# Inside Section 2 map:
row_render_old = """                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Labor description..."
                    className={`w-full border border-slate-300 rounded-md p-2 ${item.labor_service_id ? 'bg-blue-50 font-medium text-blue-900' : ''}`}
                  />"""
                  
row_render_new = """                  <div className="relative">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Labor description..."
                      className={`w-full border border-slate-300 rounded-md p-2 ${item.labor_service_id ? 'bg-blue-50 font-medium text-blue-900' : ''} ${item.item_type === 'PACKAGE_ITEM' ? 'pl-8' : ''}`}
                      disabled={item.item_type === 'PACKAGE_ITEM'}
                    />
                    {item.item_type === 'PACKAGE_ITEM' && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                         <span className="w-4 h-4 bg-blue-200 text-blue-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                      </div>
                    )}
                  </div>"""

content = content.replace(row_render_old, row_render_new)

# Modify Section 2 Price render for package items
s2_price_old = """                  <div className="w-32">
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
                  </div>"""

s2_price_new = """                  <div className="w-32">
                    {item.item_type === 'PACKAGE_ITEM' ? (
                      <div className="w-full p-2 text-right text-slate-400 text-sm italic">
                        Inc. in Pkg
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="0" step="0.01"
                        value={item.unit_price}
                        onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                        placeholder="Price"
                        className="w-full border border-slate-300 rounded-md p-2 text-right"
                      />
                    )}
                  </div>
                  <div className="w-32 text-right font-medium text-slate-800 pr-2">
                    {item.item_type === 'PACKAGE_ITEM' ? (
                       <span className="text-slate-400 italic">₱0.00</span>
                    ) : (
                       <span>₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>"""
content = content.replace(s2_price_old, s2_price_new)

# -----------------
# Section 3: Parts
section3_filter_old = "items.filter(i => i.item_type === 'PART')"
section3_filter_new = "items.filter(i => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category)))"
content = content.replace(section3_filter_old, section3_filter_new)

# Section 3 Row Description update
s3_desc_old = """              <div className="flex-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Part description..."
                  className="w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900"
                />
              </div>"""

s3_desc_new = """              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Part description..."
                    className={`w-full border border-slate-300 rounded-md p-2 bg-emerald-50/50 font-medium text-emerald-900 ${item.item_type === 'PACKAGE_ITEM' ? 'pl-8' : ''}`}
                    disabled={item.item_type === 'PACKAGE_ITEM'}
                  />
                  {item.item_type === 'PACKAGE_ITEM' && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                       <span className="w-4 h-4 bg-emerald-200 text-emerald-700 flex items-center justify-center rounded-full text-[10px] font-bold" title="Package Component">P</span>
                    </div>
                  )}
                </div>
              </div>"""
content = content.replace(s3_desc_old, s3_desc_new)

# Section 3 Price update
s3_price_old = """              <div className="w-32">
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
              </div>"""

s3_price_new = """              <div className="w-32">
                {item.item_type === 'PACKAGE_ITEM' ? (
                  <div className="w-full p-2 text-right text-slate-400 text-sm italic">
                    Inc. in Pkg
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0" step="0.01"
                    value={item.unit_price}
                    onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                    placeholder="Price"
                    className="w-full border border-slate-300 rounded-md p-2 text-right"
                  />
                )}
              </div>
              <div className="w-32 text-right font-medium text-slate-800 pr-2 flex items-center justify-end h-full">
                {item.item_type === 'PACKAGE_ITEM' ? (
                   <span className="text-slate-400 italic mt-2">₱0.00</span>
                ) : (
                   <span className="mt-2">₱{((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
              </div>"""

content = content.replace(s3_price_old, s3_price_new)

with open('src/components/quotations/QuotationForm.tsx', 'w') as f:
    f.write(content)

