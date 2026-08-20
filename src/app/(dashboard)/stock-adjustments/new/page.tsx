'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
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

export default function NewStockAdjustmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Pre-fill from URL if provided (e.g., from inventory detail page)
  const initialPartId = searchParams.get('part_id') || ''

  const [selectedPartId, setSelectedPartId] = useState(initialPartId)
  const [selectedPart, setSelectedPart] = useState<any>(null)
  
  const [adjType, setAdjType] = useState<'Increase Stock' | 'Decrease Stock'>('Increase Stock')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('Physical Count Correction')
  const [notes, setNotes] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch part details if initialPartId is provided
  useEffect(() => {
    if (initialPartId && !selectedPart) {
      fetchPart(initialPartId)
    }
  }, [initialPartId])

  const fetchPart = async (id: string) => {
    const { data } = await supabase.from('parts').select('*, brands(name)').eq('id', id).single()
    if (data) setSelectedPart(data)
  }

  // Calculate preview
  const currentStock = selectedPart ? Number(selectedPart.stock_quantity) || 0 : 0
  const adjQty = Number(quantity) || 0
  
  let newStock = currentStock
  if (adjQty > 0) {
    newStock = adjType === 'Increase Stock' ? currentStock + adjQty : currentStock - adjQty
  }

  // Auto-switch type for specific reasons to prevent common mistakes
  useEffect(() => {
    if (reason === 'Damaged Item' || reason === 'Expired Item' || reason === 'Lost Item' || reason === 'Supplier Return') {
      setAdjType('Decrease Stock')
    } else if (reason === 'Found Stock' || reason === 'Customer Return' || reason === 'Opening Balance') {
      setAdjType('Increase Stock')
    }
  }, [reason])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!selectedPartId) {
      setError("Please select a Part / Material.")
      setIsSubmitting(false)
      return
    }

    if (adjQty <= 0) {
      setError("Quantity must be greater than zero.")
      setIsSubmitting(false)
      return
    }

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

    if (newStock < 0) {
      setError("Adjustment exceeds available stock. Negative stock is not allowed.")
      setIsSubmitting(false)
      return
    }

    // Get current user for audit
    const { data: { user } } = await supabase.auth.getUser()

    // Determine movement values
    const movementType = reason === 'Opening Balance' 
      ? 'OPENING_BALANCE' 
      : adjType === 'Increase Stock' ? 'POSITIVE_ADJUSTMENT' : 'NEGATIVE_ADJUSTMENT'
      
    // Quantity in movement ledger is always positive for IN, negative for OUT
    const movementQty = adjType === 'Increase Stock' ? adjQty : -Math.abs(adjQty)

    const payload = {
      part_id: selectedPartId,
      movement_type: movementType,
      quantity: movementQty,
      unit_cost: selectedPart?.cost || 0,
      reference_type: reason, // Store the reason here
      notes: notes.trim() || null,
      created_by: user?.id || null
    }

    const { error: insertError } = await supabase
      .from('inventory_movements')
      .insert(payload)

    if (insertError) {
      setError(`Failed to save adjustment: ${insertError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/stock-adjustments')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
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

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Part / Material *</label>
                <PartSearchSelector 
                  selectedPartId={selectedPartId} 
                  setSelectedPartId={setSelectedPartId} 
                  onSelectPart={setSelectedPart}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Type *</label>
                <div className="flex bg-slate-100 p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setAdjType('Increase Stock')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                      adjType === 'Increase Stock' 
                        ? 'bg-white text-green-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Increase Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('Decrease Stock')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                      adjType === 'Decrease Stock' 
                        ? 'bg-white text-red-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Decrease Stock
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      min="0.01"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className={`w-full border border-slate-300 rounded-md p-2 font-bold text-lg ${
                        adjType === 'Increase Stock' ? 'text-green-700' : 'text-red-700'
                      }`}
                    />
                    {selectedPart && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        {selectedPart.unit}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-md p-2" 
                  placeholder={reason === 'Other' ? "Please specify reason..." : "Optional internal notes..."}
                ></textarea>
              </div>
            </div>

            {/* RIGHT COLUMN - PREVIEW */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-6 text-center uppercase">Adjustment Preview</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                  <span className="text-slate-600 font-medium">Current Stock</span>
                  <span className="text-2xl font-bold text-slate-800">
                    {currentStock} <span className="text-sm font-normal text-slate-500">{selectedPart?.unit || ''}</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                  <span className="text-slate-600 font-medium">Adjustment</span>
                  <span className={`text-2xl font-bold ${
                    adjQty === 0 ? 'text-slate-400' : adjType === 'Increase Stock' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {adjQty === 0 ? '' : adjType === 'Increase Stock' ? '+' : '-'}{adjQty}
                  </span>
                </div>
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-slate-800 font-bold text-lg">Resulting Stock</span>
                  <span className={`text-4xl font-black ${
                    newStock < 0 ? 'text-red-600' : 'text-blue-700'
                  }`}>
                    {newStock} <span className="text-lg font-normal opacity-70">{selectedPart?.unit || ''}</span>
                  </span>
                </div>

                {newStock < 0 && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center font-medium">
                    Cannot save: Stock would become negative.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/stock-adjustments"
            className="px-6 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting || newStock < 0 || adjQty <= 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-md font-medium transition flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
          </button>
        </div>
      </form>
    </div>
  )
}
