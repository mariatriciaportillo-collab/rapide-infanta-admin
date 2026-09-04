'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { PartGroupCategorySelector } from '@/components/parts/PartGroupCategorySelector'
import { BrandSelector } from '@/components/parts/BrandSelector'

export default function AddPartPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [hasEditedDisplayName, setHasEditedDisplayName] = useState(false)
  const [partNumber, setPartNumber] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [unit, setUnit] = useState('pc')
  
  const [cost, setCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('0')
  const [reorderLevel, setReorderLevel] = useState('0')
  
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [autoSuggestLabor, setAutoSuggestLabor] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name.trim()) {
      setError("Please enter a Part / Product Name.")
      setIsSubmitting(false)
      return
    }

    if (!selectedGroupId || !selectedCategoryId) {
      setError("Please select both Group and Category.")
      setIsSubmitting(false)
      return
    }

    if (!sellingPrice || isNaN(Number(sellingPrice))) {
      setError("Please enter a valid Selling Price.")
      setIsSubmitting(false)
      return
    }

    // Duplicate part number check
    if (partNumber.trim()) {
      const { data: existingPart } = await supabase
        .from('parts')
        .select('id')
        .ilike('part_number', partNumber.trim())
        .maybeSingle()
        
      if (existingPart) {
        setError(`A part with Part Number ${partNumber.trim()} already exists.`)
        setIsSubmitting(false)
        return
      }
    }

    const payload = {
      display_name: displayName.trim(),
      name: name.trim(),
      part_number: partNumber.trim() || null,
      brand_id: selectedBrandId || null,
      group_id: selectedGroupId,
      category_id: selectedCategoryId,
      unit: unit,
      cost: cost ? parseFloat(cost) : 0,
      selling_price: parseFloat(sellingPrice),
      stock_quantity: stockQuantity ? parseFloat(stockQuantity) : 0,
      reorder_level: reorderLevel ? parseFloat(reorderLevel) : 0,
      notes: notes.trim() || null,
      is_active: isActive,
        auto_suggest_labor: autoSuggestLabor
      }

    const { data: newPart, error: insertError } = await supabase.from('parts').insert(payload).select('id').single()

    if (insertError) {
      setError(`Failed to save part: ${insertError.message}`)
      setIsSubmitting(false)
      return
    }

    if (autoSuggestLabor) {
          if (confirm('Part saved successfully! Set up a Labor Rule for this Part now?')) {
            router.push(`/part-labor-rules/new?part_id=${newPart.id}`)
            return
          }
        }
        router.push('/parts')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/parts" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Add Part / Material</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">PRODUCT INFORMATION</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Part / Product Name *</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  if (!hasEditedDisplayName) setDisplayName(e.target.value)
                }}
                className="w-full border border-slate-300 rounded-md p-2 font-medium" 
                placeholder="e.g. Toyota Engine Oil 5W-30 (Internal)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
              <input 
                required 
                type="text" 
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value)
                  setHasEditedDisplayName(true)
                }}
                className="w-full border border-slate-300 rounded-md p-2 font-medium text-blue-900 bg-blue-50/50" 
                placeholder="e.g. Engine Oil 5W-30"
              />
              <p className="text-xs text-slate-500 mt-1">This is the cleaner name shown on quotations, invoices, and printed documents to the customer.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Part Number / SKU</label>
              <input 
                type="text" 
                value={partNumber}
                onChange={e => setPartNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="e.g. 90915-YZZE1" 
              />
            </div>
            
            <div>
              <BrandSelector selectedBrandId={selectedBrandId} setSelectedBrandId={setSelectedBrandId} />
            </div>

            <div className="md:col-span-2">
              <PartGroupCategorySelector 
                selectedGroupId={selectedGroupId}
                setSelectedGroupId={setSelectedGroupId}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <select 
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="pc">pc</option>
                <option value="pcs">pcs</option>
                <option value="liter">liter</option>
                <option value="ml">ml</option>
                <option value="bottle">bottle</option>
                <option value="can">can</option>
                <option value="set">set</option>
                <option value="pair">pair</option>
                <option value="kit">kit</option>
                <option value="roll">roll</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">PRICING</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  className="w-full border border-slate-300 rounded-md py-2 pl-8 pr-3" 
                  placeholder="0.00" 
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Internal cost. Not shown to customers.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₱</span>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-md py-2 pl-8 pr-3 font-semibold text-blue-700 bg-blue-50" 
                  placeholder="0.00" 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">INVENTORY</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
              <input 
                type="number" 
                step="0.01"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={reorderLevel}
                onChange={e => setReorderLevel(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2" 
              />
            </div>
          </div>
        </div>
        
        
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">AUTOMATION</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-800">Auto-Suggest Labor?</label>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">If Yes, selecting this part in a Quotation/Estimate can automatically suggest related repair labor (configured in Part-to-Labor Rules).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoSuggestLabor}
                  onChange={(e) => setAutoSuggestLabor(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-8">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2" 
                placeholder="Optional internal notes..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                value={isActive ? 'active' : 'inactive'}
                onChange={e => setIsActive(e.target.value === 'active')}
                className="w-full border border-slate-300 rounded-md p-2 bg-white max-w-xs"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/parts"
            className="px-6 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-md font-medium transition flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Part'}
          </button>
        </div>
      </form>
    </div>
  )
}
