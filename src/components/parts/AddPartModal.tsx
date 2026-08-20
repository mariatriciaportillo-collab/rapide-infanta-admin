'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Save, AlertCircle } from 'lucide-react'
import { BrandSelector } from '@/components/parts/BrandSelector'
import { PartGroupCategorySelector } from '@/components/parts/PartGroupCategorySelector'

type Props = {
  onClose: () => void
  onSuccess: (partId: string) => void
}

export function AddPartModal({ onClose, onSuccess }: Props) {
  const supabase = createClient()
  
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [hasEditedDisplayName, setHasEditedDisplayName] = useState(false)
  
  const [partNumber, setPartNumber] = useState('')
  const [brandId, setBrandId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [cost, setCost] = useState('0')
  const [sellingPrice, setSellingPrice] = useState('0')
  const [reorderLevel, setReorderLevel] = useState('0')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNameChange = (val: string) => {
    setName(val)
    if (!hasEditedDisplayName) {
      setDisplayName(val)
    }
  }

  const handleDisplayNameChange = (val: string) => {
    setDisplayName(val)
    setHasEditedDisplayName(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name.trim() || !displayName.trim() || !groupId || !categoryId || !sellingPrice) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    if (partNumber.trim()) {
      const { data: existing } = await supabase.from('parts').select('id').eq('part_number', partNumber.trim()).single()
      if (existing) {
        setError("A part with this Part Number / SKU already exists.")
        setIsSubmitting(false)
        return
      }
    }

    const payload = {
      name: name.trim(),
      display_name: displayName.trim(),
      part_number: partNumber.trim() || null,
      brand_id: brandId || null,
      group_id: groupId,
      category_id: categoryId,
      unit: unit,
      cost: Number(cost) || 0,
      selling_price: Number(sellingPrice) || 0,
      stock_quantity: 0,
      reorder_level: Number(reorderLevel) || 0,
      notes: notes.trim() || null,
      is_active: true
    }

    const { data, error: insertError } = await supabase
      .from('parts')
      .insert(payload)
      .select('id')
      .single()

    if (insertError) {
      setError(`Failed to save part: ${insertError.message}`)
      setIsSubmitting(false)
      return
    }

    onSuccess(data.id)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200 flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <form id="add-part-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Part / Product Name *</label>
                <input required type="text" value={name} onChange={e => handleNameChange(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 font-medium" placeholder="e.g. Toyota Engine Oil 5W-30 (Internal)" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name *</label>
                <input required type="text" value={displayName} onChange={e => handleDisplayNameChange(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 font-medium text-blue-900 bg-blue-50/50" placeholder="e.g. Engine Oil 5W-30" />
                <p className="text-xs text-slate-500 mt-1">This is the cleaner name shown on quotations, invoices, and printed documents to the customer.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Part Number / SKU</label>
                <input type="text" value={partNumber} onChange={e => setPartNumber(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. TY-5W30-1L" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                <BrandSelector selectedBrandId={brandId} setSelectedBrandId={setBrandId} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <PartGroupCategorySelector selectedGroupId={groupId} selectedCategoryId={categoryId} setSelectedGroupId={setGroupId} setSelectedCategoryId={setCategoryId} />
            </div>
            
            <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measure *</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 bg-white">
                  <option value="pcs">pcs</option>
                  <option value="liters">liters</option>
                  <option value="set">set</option>
                  <option value="bottles">bottles</option>
                  <option value="gallons">gallons</option>
                  <option value="meters">meters</option>
                  <option value="box">box</option>
                  <option value="pair">pair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price *</label>
                <input required type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                <input type="number" step="1" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. 5" />
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full border border-slate-300 rounded-md p-2" placeholder="Optional internal notes..."></textarea>
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-white transition">Cancel</button>
          <button type="submit" form="add-part-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">
            <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  )
}
