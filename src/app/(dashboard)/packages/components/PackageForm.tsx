'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Plus, Trash2, Search, Package } from 'lucide-react'

export default function PackageForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!initialData
  
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(initialData?.name || '')
  const [packageCode, setPackageCode] = useState(initialData?.package_code || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [packagePrice, setPackagePrice] = useState(initialData?.package_price?.toString() || '0')
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  
  const [items, setItems] = useState<any[]>(initialData?.package_items?.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    item_type: item.item_type,
    record_id: item.item_type === 'LABOR' ? item.labor_charge_id : item.part_id,
    record: item.item_type === 'LABOR' ? item.labor_charges : item.parts,
    quantity: item.quantity?.toString() || '1'
  })) || [])
  
  // Lookups
  const [laborSearch, setLaborSearch] = useState('')
  const [partSearch, setPartSearch] = useState('')
  
  const [laborResults, setLaborResults] = useState<any[]>([])
  const [partResults, setPartResults] = useState<any[]>([])
  const [isSearchingLabor, setIsSearchingLabor] = useState(false)
  const [isSearchingPart, setIsSearchingPart] = useState(false)

  // Searching Labor
  useEffect(() => {
    if (!laborSearch.trim()) {
      setLaborResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingLabor(true)
      const { data } = await supabase.from('labor_charges').select('*').ilike('service_name', `%${laborSearch}%`).limit(15)
      setLaborResults(data || [])
      setIsSearchingLabor(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [laborSearch, supabase])

  // Searching Parts
  useEffect(() => {
    if (!partSearch.trim()) {
      setPartResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingPart(true)
      const { data } = await supabase.from('parts').select('*, brands(name)').or(`name.ilike.%${partSearch}%,part_number.ilike.%${partSearch}%`).limit(15)
      setPartResults(data || [])
      setIsSearchingPart(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [partSearch, supabase])

  const addItem = (type: 'LABOR' | 'PART') => {
    setItems([...items, { id: crypto.randomUUID(), item_type: type, record_id: null, record: null, quantity: '1' }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const selectItemRecord = (id: string, record: any, type: 'LABOR' | 'PART') => {
    // Check duplicates
    const isDuplicate = items.some(i => i.id !== id && i.item_type === type && i.record_id === record.id)
    if (isDuplicate) {
      alert("This item is already added to the package.")
      return
    }
    updateItem(id, 'record_id', record.id)
    updateItem(id, 'record', record)
    setLaborSearch('')
    setPartSearch('')
  }

  const calcRegularValue = () => {
    return items.reduce((sum, item) => {
      if (!item.record) return sum
      const qty = Number(item.quantity) || 0
      const selling = item.item_type === 'LABOR' ? Number(item.record.rate) || 0 : Number(item.record.selling_price) || 0
      return sum + (qty * selling)
    }, 0)
  }

  const regularValue = calcRegularValue()
  const price = Number(packagePrice) || 0
  const savings = Math.max(0, regularValue - price)

  const handlePriceChange = (val: string) => {
    if (val === '') {
      setPackagePrice('0')
      return
    }
    const num = Number(val)
    setPackagePrice(num.toString()) // removes leading zeroes automatically
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert("Package Name is required")
    if (items.length === 0) return alert("At least one item is required")
    if (items.some(i => !i.record_id)) return alert("Please select a specific item for all rows")
    if (items.some(i => Number(i.quantity) <= 0)) return alert("Quantity must be greater than 0")

    setLoading(true)

    const payload = {
      name,
      package_code: packageCode,
      category,
      description,
      package_price: Number(packagePrice),
      is_active: isActive
    }

    try {
      let pkgId = initialData?.id

      if (isEditing) {
        const { error } = await supabase.from('packages').update(payload).eq('id', pkgId)
        if (error) throw error
        
        // Remove old items
        await supabase.from('package_items').delete().eq('package_id', pkgId)
      } else {
        const { data, error } = await supabase.from('packages').insert([payload]).select().single()
        if (error) throw error
        pkgId = data.id
      }

      // Insert items
      const itemsPayload = items.map(item => ({
        package_id: pkgId,
        item_type: item.item_type,
        labor_charge_id: item.item_type === 'LABOR' ? item.record_id : null,
        part_id: item.item_type === 'PART' ? item.record_id : null,
        quantity: Number(item.quantity)
      }))

      const { error: itemsErr } = await supabase.from('package_items').insert(itemsPayload)
      if (itemsErr) throw itemsErr

      router.push('/packages')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "An error occurred saving the package.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/packages" className="p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{isEditing ? 'Edit Package' : 'New Package'}</h1>
          <p className="text-slate-500 mt-1">Configure package components and pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" /> Package Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Package Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Basic PMS"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Package Code</label>
                <input 
                  type="text" 
                  value={packageCode} 
                  onChange={e => setPackageCode(e.target.value)} 
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" 
                  placeholder="e.g. PKG-001"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Preventive Maintenance"
                />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={e => setIsActive(e.target.checked)} 
                    className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Active Package</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description / Notes</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Details about what is included..."
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Package Items</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => addItem('LABOR')} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-sm font-bold transition flex items-center gap-1">
                  <Plus size={16} /> Labor
                </button>
                <button type="button" onClick={() => addItem('PART')} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-sm font-bold transition flex items-center gap-1">
                  <Plus size={16} /> Part
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50">
                <p className="text-slate-500 font-medium">No items added to this package yet.</p>
                <p className="text-sm text-slate-400 mt-1">Click the buttons above to add labor or parts.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item, index) => {
                  const isLabor = item.item_type === 'LABOR'
                  const title = isLabor ? 'Labor / Service' : 'Part / Product'
                  const color = isLabor ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  
                  return (
                    <div key={item.id} className="border border-slate-200 rounded-lg bg-slate-50 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className={`px-2 py-1 rounded text-xs font-bold border shrink-0 ${color}`}>
                        {title}
                      </div>
                      
                      <div className="flex-1 w-full relative">
                        {item.record ? (
                          <div className="bg-white border border-slate-300 p-2.5 rounded-md flex justify-between items-center w-full shadow-sm">
                            <div>
                              <div className="font-bold text-slate-800">{isLabor ? item.record.service_name : item.record.name}</div>
                              {!isLabor && <div className="text-xs text-slate-500 font-mono mt-0.5">{item.record.part_number} • {item.record.brands?.name}</div>}
                            </div>
                            <button type="button" onClick={() => { updateItem(item.id, 'record_id', null); updateItem(item.id, 'record', null); }} className="text-blue-600 hover:underline text-sm font-bold">
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input 
                                type="text"
                                placeholder={`Search ${title.toLowerCase()}...`}
                                onChange={e => isLabor ? setLaborSearch(e.target.value) : setPartSearch(e.target.value)}
                                className="w-full pl-9 p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* Search Dropdown */}
                            {((isLabor && laborSearch) || (!isLabor && partSearch)) && (
                              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                {(isLabor ? isSearchingLabor : isSearchingPart) ? (
                                  <div className="p-3 text-sm text-slate-500">Searching...</div>
                                ) : (isLabor ? laborResults : partResults).length === 0 ? (
                                  <div className="p-3 text-sm text-slate-500">No results found</div>
                                ) : (
                                  (isLabor ? laborResults : partResults).map(res => (
                                    <div 
                                      key={res.id} 
                                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0"
                                      onClick={() => selectItemRecord(item.id, res, item.item_type)}
                                    >
                                      <div className="font-bold text-slate-800">{isLabor ? res.service_name : res.name}</div>
                                      <div className="text-sm text-slate-500 flex justify-between mt-1">
                                        <span>{isLabor ? res.category : res.part_number}</span>
                                        <span className="font-bold text-blue-700">₱{Number(isLabor ? res.rate : res.selling_price).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-24 shrink-0">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Qty</label>
                        <input 
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-md text-right font-medium"
                        />
                      </div>
                      
                      <div className="w-28 shrink-0 text-right">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Regular</label>
                        <div className="p-2 text-slate-800 font-bold">
                          ₱{((Number(item.quantity) || 0) * (item.record ? Number(isLabor ? item.record.rate : item.record.selling_price) : 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition shrink-0 mt-5">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-6">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Pricing Summary</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Regular Value</span>
                <span className="font-bold text-slate-800 text-lg">
                  ₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Package Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₱</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={packagePrice} 
                    onChange={e => handlePriceChange(e.target.value)} 
                    required
                    className="w-full pl-8 pr-4 py-3 bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-lg font-black text-xl focus:outline-none focus:ring-0 focus:border-blue-400 transition" 
                  />
                </div>
              </div>

              {savings > 0 && (
                <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100 mt-2">
                  <span className="font-bold text-sm">Customer Savings</span>
                  <span className="font-black text-lg">
                    ₱{savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-lg">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-md transition shadow-md flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {loading ? 'Saving Package...' : 'Save Package'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
