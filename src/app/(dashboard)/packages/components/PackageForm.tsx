'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Plus, Trash2, Search, Package, Wrench, Box, Printer } from 'lucide-react'

export default function PackageForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!initialData
  
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(initialData?.name || '')
  const [packageCode, setPackageCode] = useState(initialData?.package_code || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  
  // Print Options
  const [hideLabor, setHideLabor] = useState(initialData?.hide_labor ?? false)
  const [hideParts, setHideParts] = useState(initialData?.hide_parts ?? false)
  const [displayPackageCode, setDisplayPackageCode] = useState(initialData?.display_package_code ?? false)
  const [hideAmounts, setHideAmounts] = useState(initialData?.hide_amounts ?? false)
  const [replacementText, setReplacementText] = useState(initialData?.replacement_text || '')

  const [items, setItems] = useState<any[]>(initialData?.package_items?.map((item: any) => ({
    id: item.id || crypto.randomUUID(),
    item_type: item.item_type,
    is_category: item.is_category || false,
    record_id: item.item_type === 'LABOR' ? item.labor_service_id : item.part_id,
    record: item.item_type === 'LABOR' ? item.labor_services : item.parts,
    category_id: item.part_category_id,
    category_record: item.part_categories,
    quantity: item.quantity?.toString() || '1',
    price: item.price?.toString() || '0'
  })) || [])
  
  // Lookups
  const [laborSearch, setLaborSearch] = useState('')
  const [partSearch, setPartSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  
  const [laborResults, setLaborResults] = useState<any[]>([])
  const [partResults, setPartResults] = useState<any[]>([])
  const [categoryResults, setCategoryResults] = useState<any[]>([])
  
  const [isSearchingLabor, setIsSearchingLabor] = useState(false)
  const [isSearchingPart, setIsSearchingPart] = useState(false)
  const [isSearchingCategory, setIsSearchingCategory] = useState(false)

  // Searching Labor
  useEffect(() => {
    if (!laborSearch.trim()) {
      setLaborResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingLabor(true)
      const { data } = await supabase.from('labor_services').select('id, name, rate, is_active').ilike('name', `%${laborSearch}%`).limit(15)
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
      const { data } = await supabase.from('parts').select('id, name, part_number, selling_price, brands(name)').or(`name.ilike.%${partSearch}%,part_number.ilike.%${partSearch}%`).limit(15)
      setPartResults(data || [])
      setIsSearchingPart(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [partSearch, supabase])

  // Searching Categories
  useEffect(() => {
    if (!categorySearch.trim()) {
      setCategoryResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingCategory(true)
      const { data } = await supabase.from('part_categories').select('id, name').ilike('name', `%${categorySearch}%`).limit(15)
      setCategoryResults(data || [])
      setIsSearchingCategory(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [categorySearch, supabase])

  const addItem = (type: 'LABOR' | 'PART') => {
    setItems([...items, { id: crypto.randomUUID(), item_type: type, is_category: false, record_id: null, record: null, category_id: null, category_record: null, quantity: '1', price: '' }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const toggleCategoryMode = (id: string, useCategory: boolean) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, is_category: useCategory, record_id: null, record: null, category_id: null, category_record: null, price: '' }
      }
      return item
    }))
    setPartSearch('')
    setCategorySearch('')
  }

  const selectItemRecord = (id: string, record: any, type: 'LABOR' | 'PART') => {
    const isDuplicate = items.some(i => i.id !== id && i.item_type === type && !i.is_category && i.record_id === record.id)
    if (isDuplicate) {
      alert(`This ${type === 'LABOR' ? 'labor service' : 'part'} is already included in the package.`)
      return
    }
    
    const initialPrice = type === 'LABOR' ? (record.rate || 0) : (record.selling_price || 0)
    
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, record_id: record.id, record: record, price: initialPrice.toString() }
      }
      return item
    }))

    if (type === 'LABOR') setLaborSearch('')
    if (type === 'PART') setPartSearch('')
  }

  const selectCategoryRecord = (id: string, record: any) => {
    const isDuplicate = items.some(i => i.id !== id && i.item_type === 'PART' && i.is_category && i.category_id === record.id)
    if (isDuplicate) {
      alert(`This category is already included in the package.`)
      return
    }
    
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, category_id: record.id, category_record: record, price: '' }
      }
      return item
    }))
    
    setCategorySearch('')
  }

  const handlePriceInput = (id: string, val: string) => {
    if (val === '') {
      updateItem(id, 'price', '')
      return
    }
    updateItem(id, 'price', Number(val).toString())
  }

  const laborItems = items.filter(i => i.item_type === 'LABOR')
  const partItems = items.filter(i => i.item_type === 'PART')

  const calcLaborValue = () => {
    return laborItems.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0)
  }

  const calcPartsValue = () => {
    return partItems.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0)
  }

  const laborTotal = calcLaborValue()
  const partsTotal = calcPartsValue()
  const packageTotal = laborTotal + partsTotal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return alert("Package Name is required")
    if (items.length === 0) return alert("At least one item (Labor or Part) is required")
    if (items.some(i => (i.item_type === 'LABOR' && !i.record_id) || (i.item_type === 'PART' && !i.is_category && !i.record_id) || (i.item_type === 'PART' && i.is_category && !i.category_id))) {
      return alert("Please select a specific item or category for all rows")
    }
    if (items.some(i => Number(i.quantity) <= 0)) return alert("Quantity must be greater than 0")
    if (items.some(i => i.price === '' || Number(i.price) < 0)) return alert("Price/Rate must be a valid number for all rows")

    setLoading(true)

    const payload = {
      name: name.trim(),
      package_code: packageCode.trim(),
      category: category.trim(),
      description: description.trim(),
      package_price: packageTotal,
      is_active: isActive,
      hide_labor: hideLabor,
      hide_parts: hideParts,
      display_package_code: displayPackageCode,
      hide_amounts: hideAmounts,
      replacement_text: replacementText.trim()
    }

    try {
      let pkgId = initialData?.id

      if (isEditing) {
        const { data: dupData } = await supabase.from('packages').select('id').eq('name', payload.name).neq('id', pkgId).limit(1)
        if (dupData && dupData.length > 0) {
          alert("A package with this name already exists.")
          setLoading(false)
          return
        }

        const { error } = await supabase.from('packages').update(payload).eq('id', pkgId)
        if (error) throw error
        
        await supabase.from('package_items').delete().eq('package_id', pkgId)
      } else {
        const { data: dupData } = await supabase.from('packages').select('id').eq('name', payload.name).limit(1)
        if (dupData && dupData.length > 0) {
          alert("A package with this name already exists.")
          setLoading(false)
          return
        }

        const { data, error } = await supabase.from('packages').insert([payload]).select().single()
        if (error) throw error
        pkgId = data.id
      }

      const itemsPayload = items.map(item => ({
        package_id: pkgId,
        item_type: item.item_type,
        is_category: item.is_category || false,
        labor_service_id: item.item_type === 'LABOR' ? item.record_id : null,
        part_id: item.item_type === 'PART' && !item.is_category ? item.record_id : null,
        part_category_id: item.item_type === 'PART' && item.is_category ? item.category_id : null,
        quantity: Number(item.quantity),
        price: Number(item.price)
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          
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
                  placeholder="e.g. Toyota Change Oil Package (Gas)"
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
                  placeholder="e.g. PMS"
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
                rows={2}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Details about what is included..."
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Printer size={20} className="text-slate-600" /> Line Items Printout Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="text-sm font-bold text-slate-700">Hide Labor / Services</span>
                <select 
                  value={hideLabor ? 'yes' : 'no'} 
                  onChange={e => setHideLabor(e.target.value === 'yes')}
                  className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              
              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="text-sm font-bold text-slate-700">Hide Parts & Materials</span>
                <select 
                  value={hideParts ? 'yes' : 'no'} 
                  onChange={e => setHideParts(e.target.value === 'yes')}
                  className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="text-sm font-bold text-slate-700">Display Package Code</span>
                <select 
                  value={displayPackageCode ? 'yes' : 'no'} 
                  onChange={e => setDisplayPackageCode(e.target.value === 'yes')}
                  className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              
              <label className="flex flex-col gap-2 cursor-pointer">
                <span className="text-sm font-bold text-slate-700">Hide Amounts</span>
                <select 
                  value={hideAmounts ? 'yes' : 'no'} 
                  onChange={e => setHideAmounts(e.target.value === 'yes')}
                  className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Replacement Text</label>
              <input 
                type="text" 
                value={replacementText} 
                onChange={e => setReplacementText(e.target.value)} 
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="e.g. Package Includes Labor & Materials"
              />
            </div>
          </div>

          {/* LABOR SECTION */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0 rounded-t-lg">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wrench size={20} className="text-indigo-600" /> Labor
              </h2>
            </div>
            
            <div className="p-0 overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3 font-bold">Labor / Service</th>
                    <th className="px-4 py-3 font-bold text-right w-32">Rate</th>
                    <th className="px-4 py-3 font-bold text-right w-24">Hours / Qty</th>
                    <th className="px-4 py-3 font-bold text-right w-32">Amount</th>
                    <th className="px-4 py-3 font-bold text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laborItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 bg-slate-50/50">
                        No labor added yet.
                      </td>
                    </tr>
                  ) : (
                    laborItems.map(item => {
                      const rate = Number(item.price) || 0
                      const qty = Number(item.quantity) || 0
                      const amount = rate * qty
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-3">
                            {item.record ? (
                              <div className="flex justify-between items-center group">
                                <span className="font-bold text-slate-800">{item.record.name}</span>
                              </div>
                            ) : (
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                  type="text"
                                  placeholder="Search labor/service..."
                                  onChange={e => setLaborSearch(e.target.value)}
                                  className="w-full pl-8 p-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                {laborSearch && (
                                  <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded shadow-xl z-50 max-h-60 overflow-y-auto min-w-[280px]">
                                    {isSearchingLabor ? (
                                      <div className="p-2 text-xs text-slate-500">Searching...</div>
                                    ) : laborResults.length === 0 ? (
                                      <div className="p-2 text-xs text-slate-500">No results found.</div>
                                    ) : (
                                      laborResults.map(res => (
                                        <div 
                                          key={res.id} 
                                          className="p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
                                          onClick={() => selectItemRecord(item.id, res, 'LABOR')}
                                        >
                                          <div className="font-bold text-slate-800 text-sm">{res.name}</div>
                                          <div className="text-xs font-bold text-blue-700 mt-0.5">₱{Number(res.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                              <input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={e => handlePriceInput(item.id, e.target.value)}
                                disabled={!item.record}
                                className="w-full pl-6 p-1.5 text-sm border border-slate-300 rounded text-right font-medium focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-full p-1.5 text-sm border border-slate-300 rounded text-right font-bold focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">
                            ₱{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end rounded-b-lg">
              <button type="button" onClick={() => addItem('LABOR')} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-md text-sm font-bold transition flex items-center gap-1 shadow-sm">
                <Plus size={16} /> Add Labor
              </button>
            </div>
          </div>

          {/* PARTS & MATERIALS SECTION */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0 rounded-t-lg">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Box size={20} className="text-emerald-600" /> Parts & Materials
              </h2>
            </div>
            
            <div className="p-0 overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-3 font-bold w-32">Category?</th>
                    <th className="px-4 py-3 font-bold">Part / Category</th>
                    <th className="px-4 py-3 font-bold">Part No.</th>
                    <th className="px-4 py-3 font-bold">Brand</th>
                    <th className="px-4 py-3 font-bold text-right w-28">Price</th>
                    <th className="px-4 py-3 font-bold text-right w-24">Qty</th>
                    <th className="px-4 py-3 font-bold text-right w-32">Amount</th>
                    <th className="px-4 py-3 font-bold text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500 bg-slate-50/50">
                        No parts or materials added yet.
                      </td>
                    </tr>
                  ) : (
                    partItems.map(item => {
                      const price = Number(item.price) || 0
                      const qty = Number(item.quantity) || 0
                      const amount = price * qty
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            <select 
                              value={item.is_category ? 'yes' : 'no'}
                              onChange={e => toggleCategoryMode(item.id, e.target.value === 'yes')}
                              className="w-full p-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 font-medium"
                            >
                              <option value="no">No</option>
                              <option value="yes">Yes</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {item.is_category ? (
                              item.category_record ? (
                                <div className="flex justify-between items-center group">
                                  <span className="font-bold text-slate-800">{item.category_record.name}</span>
                                </div>
                              ) : (
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                  <input 
                                    type="text"
                                    placeholder="Search category..."
                                    onChange={e => setCategorySearch(e.target.value)}
                                    className="w-full pl-8 p-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 bg-amber-50"
                                    autoFocus
                                  />
                                  {categorySearch && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded shadow-xl z-50 max-h-60 overflow-y-auto min-w-[250px]">
                                      {isSearchingCategory ? (
                                        <div className="p-2 text-xs text-slate-500">Searching...</div>
                                      ) : categoryResults.length === 0 ? (
                                        <div className="p-2 text-xs text-slate-500">No results found.</div>
                                      ) : (
                                        categoryResults.map(res => (
                                          <div 
                                            key={res.id} 
                                            className="p-2 hover:bg-amber-100 cursor-pointer border-b border-slate-50 last:border-0"
                                            onClick={() => selectCategoryRecord(item.id, res)}
                                          >
                                            <div className="font-bold text-slate-800 text-sm">{res.name}</div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            ) : (
                              item.record ? (
                                <div className="flex justify-between items-center group">
                                  <span className="font-bold text-slate-800">{item.record.name}</span>
                                </div>
                              ) : (
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                  <input 
                                    type="text"
                                    placeholder="Search product..."
                                    onChange={e => setPartSearch(e.target.value)}
                                    className="w-full pl-8 p-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                                    autoFocus
                                  />
                                  {partSearch && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded shadow-xl z-50 max-h-60 overflow-y-auto min-w-[300px]">
                                      {isSearchingPart ? (
                                        <div className="p-2 text-xs text-slate-500">Searching...</div>
                                      ) : partResults.length === 0 ? (
                                        <div className="p-2 text-xs text-slate-500">No results found.</div>
                                      ) : (
                                        partResults.map(res => (
                                          <div 
                                            key={res.id} 
                                            className="p-2 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 last:border-0"
                                            onClick={() => selectItemRecord(item.id, res, 'PART')}
                                          >
                                            <div className="font-bold text-slate-800 text-sm">{res.name}</div>
                                            <div className="text-xs text-slate-500 flex justify-between mt-1">
                                              <span>{res.part_number || 'No PN'} • {res.brands?.name || 'No Brand'}</span>
                                              <span className="font-bold text-emerald-700">₱{Number(res.selling_price).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                            {item.is_category ? '—' : (item.record ? (item.record.part_number || '—') : '—')}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.is_category ? '—' : (item.record ? (item.record.brands?.name || '—') : '—')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₱</span>
                              <input 
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={e => handlePriceInput(item.id, e.target.value)}
                                disabled={!item.is_category && !item.record}
                                className="w-full pl-6 p-1.5 text-sm border border-slate-300 rounded text-right font-medium focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-full p-1.5 text-sm border border-slate-300 rounded text-right font-bold focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800">
                            ₱{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end rounded-b-lg">
              <button type="button" onClick={() => addItem('PART')} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-md text-sm font-bold transition flex items-center gap-1 shadow-sm">
                <Plus size={16} /> Add Part / Material
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-6">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Pricing Summary</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              
              <div className="flex justify-between items-center text-slate-600 text-sm">
                <span>Labor Total</span>
                <span className="font-medium text-lg text-slate-800">
                  ₱{laborTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-slate-600 text-sm">
                <span>Parts & Materials Total</span>
                <span className="font-medium text-lg text-slate-800">
                  ₱{partsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-4 mt-2">
                <span className="font-bold text-sm uppercase tracking-wide">Total Package Amount</span>
                <span className="font-black text-2xl text-blue-700">
                  ₱{packageTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
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
