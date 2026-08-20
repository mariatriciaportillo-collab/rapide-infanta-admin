'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

const REASONS = [
  'Opening Balance',
  'Physical Count Correction',
  'Damaged Item',
  'Expired Item',
  'Lost Item',
  'Found Stock',
  'Customer Return',
  'Supplier Return',
  'Data Correction',
  'Other'
]

type AdjItem = {
  id: string
  partId: string
  part: any
  adjType: 'Increase Stock' | 'Decrease Stock'
  qty: string
}

export default function NewStockAdjustmentPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [reason, setReason] = useState('Physical Count Correction')
  const [notes, setNotes] = useState('')
  
  const [items, setItems] = useState<AdjItem[]>([
    { id: 'initial-row-1', partId: '', part: null, adjType: 'Increase Stock', qty: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partId: '', part: null, adjType: 'Increase Stock', qty: '' }])
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev)
  }

  const handleUpdateItem = (id: string, field: keyof AdjItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!reason) {
      setError("Please select a Reason.")
      setIsSubmitting(false)
      return
    }

    if (reason === 'Other' && !notes.trim()) {
      setError("Notes are required when Reason is 'Other'.")
      setIsSubmitting(false)
      return
    }

    // Validation
    const processedItems: any[] = []
    const seenParts = new Set()

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.partId) {
        setError(`Please select a Part for line ${i + 1}.`)
        setIsSubmitting(false)
        return
      }

      if (seenParts.has(item.partId)) {
        setError(`Duplicate part selected: ${item.part?.name}. Please consolidate into one line.`)
        setIsSubmitting(false)
        return
      }
      seenParts.add(item.partId)

      const qtyNum = Number(item.qty)
      if (!qtyNum || qtyNum <= 0) {
        setError(`Please enter a valid quantity for ${item.part?.name || `line ${i + 1}`}.`)
        setIsSubmitting(false)
        return
      }

      const currentStock = Number(item.part?.stock_quantity) || 0
      if (item.adjType === 'Decrease Stock' && currentStock < qtyNum) {
        setError(`Insufficient stock for ${item.part?.name}. Cannot decrease by ${qtyNum} (Current: ${currentStock}).`)
        setIsSubmitting(false)
        return
      }

      processedItems.push({
        part_id: item.partId,
        adj_type: item.adjType,
        qty: qtyNum,
        unit_cost: item.part?.cost || 0
      })
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Call RPC
    const { data, error: rpcError } = await supabase.rpc('process_stock_adjustment', {
      p_reason: reason,
      p_notes: notes.trim() || null,
      p_items: processedItems,
      p_user_id: user?.id || null
    })

    if (rpcError) {
      setError(`Failed to save adjustment: ${rpcError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/stock-adjustments')
    router.refresh()
  }

  // Summary counts
  const totalIncreases = items.filter(i => i.partId && i.adjType === 'Increase Stock').length
  const totalDecreases = items.filter(i => i.partId && i.adjType === 'Decrease Stock').length
  const totalItems = items.filter(i => i.partId).length

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/stock-adjustments" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">New Stock Adjustment</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN - MAIN FORM */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">TRANSACTION DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <select 
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 bg-white"
                >
                  <option value="" disabled>Select reason...</option>
                  {REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input 
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2" 
                  placeholder={reason === 'Other' ? "Please specify reason..." : "Optional internal notes..."}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">ITEMS ({items.length})</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {items.map((item, index) => {
                const currentStock = Number(item.part?.stock_quantity) || 0
                const adjQty = Number(item.qty) || 0
                let newStock = currentStock
                if (adjQty > 0) {
                  newStock = item.adjType === 'Increase Stock' ? currentStock + adjQty : currentStock - adjQty
                }
                const isError = newStock < 0

                return (
                  <div key={item.id} className={`p-4 rounded-lg border relative ${isError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`} style={{ zIndex: items.length - index }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400">LINE {index + 1}</span>
                      {items.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Part / Material *</label>
                        <PartSearchSelector 
                          selectedPartId={item.partId} 
                          setSelectedPartId={(id) => handleUpdateItem(item.id, 'partId', id)} 
                          onSelectPart={(p) => handleUpdateItem(item.id, 'part', p)}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Adjustment *</label>
                        <div className="flex bg-white border border-slate-300 rounded-md overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(item.id, 'adjType', 'Increase Stock')}
                            className={`flex-1 py-1.5 text-xs font-medium transition ${
                              item.adjType === 'Increase Stock' ? 'bg-green-100 text-green-800' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            + Add
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(item.id, 'adjType', 'Decrease Stock')}
                            className={`flex-1 py-1.5 text-xs font-medium transition border-l border-slate-300 ${
                              item.adjType === 'Decrease Stock' ? 'bg-red-100 text-red-800' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            - Deduct
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Qty *</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          min="0.01"
                          value={item.qty}
                          onChange={e => handleUpdateItem(item.id, 'qty', e.target.value)}
                          className={`w-full border rounded-md py-1.5 px-2 text-center font-bold ${
                            item.adjType === 'Increase Stock' ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'
                          }`}
                        />
                      </div>

                      <div className="md:col-span-2 text-right pb-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Result</div>
                        <div className={`font-bold text-lg ${isError ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.part ? (
                            <span className="flex items-center justify-end gap-2">
                              <span className="text-slate-400 text-sm">{currentStock}</span>
                              <span className="text-slate-300 text-xs">→</span>
                              <span>{newStock}</span>
                            </span>
                          ) : '—'}
                        </div>
                      </div>
                    </div>
                    {isError && (
                      <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded flex items-center gap-2">
                        <AlertCircle size={14} />
                        Cannot deduct more than the available stock of {currentStock} {item.part?.unit || 'pcs'}.
                      </div>
                    )}
                  </div>
                )
              })}

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Another Item
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - PREVIEW */}
        <div className="w-full lg:w-1/3 sticky top-6">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-6 text-center uppercase">Transaction Summary</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-medium">Total Items</span>
                <span className="text-2xl font-bold text-slate-800">{totalItems}</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-medium">Increases</span>
                <span className="text-xl font-bold text-green-600">{totalIncreases}</span>
              </div>

              <div className="flex justify-between items-end pb-2">
                <span className="text-slate-600 font-medium">Decreases</span>
                <span className="text-xl font-bold text-red-600">{totalDecreases}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-md font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Save size={20} />
                {isSubmitting ? 'Saving Transaction...' : 'Save Adjustment'}
              </button>
              <Link 
                href="/stock-adjustments"
                className="block text-center w-full py-3 mt-2 text-slate-500 font-medium hover:text-slate-700 transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

      </form>
    </div>
  )
}
