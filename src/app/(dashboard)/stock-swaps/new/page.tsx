'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, AlertCircle, RefreshCcw } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

export default function NewStockSwapPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [reason, setReason] = useState('Wrong part / replacement / exchange')
  const [notes, setNotes] = useState('')
  
  const [partOutId, setPartOutId] = useState('')
  const [partOut, setPartOut] = useState<any>(null)
  const [qtyOut, setQtyOut] = useState('')

  const [partInId, setPartInId] = useState('')
  const [partIn, setPartIn] = useState<any>(null)
  const [qtyIn, setQtyIn] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!partOutId || !partInId) {
      setError("Please select both ITEM OUT and ITEM IN.")
      setIsSubmitting(false)
      return
    }

    if (partOutId === partInId) {
      setError("ITEM OUT and ITEM IN cannot be the same part.")
      setIsSubmitting(false)
      return
    }

    const nQtyOut = Number(qtyOut)
    const nQtyIn = Number(qtyIn)

    if (!nQtyOut || nQtyOut <= 0 || !nQtyIn || nQtyIn <= 0) {
      setError("Please enter valid quantities for both items.")
      setIsSubmitting(false)
      return
    }

    const currentOutStock = Number(partOut?.stock_quantity) || 0
    if (currentOutStock < nQtyOut) {
      setError(`Insufficient stock for ${partOut?.name}. Cannot swap out ${nQtyOut} (Current: ${currentOutStock}).`)
      setIsSubmitting(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Call RPC
    const { data, error: rpcError } = await supabase.rpc('process_stock_swap', {
      p_reason: reason,
      p_notes: notes.trim() || null,
      p_part_out_id: partOutId,
      p_qty_out: nQtyOut,
      p_part_in_id: partInId,
      p_qty_in: nQtyIn,
      p_user_id: user?.id || null
    })

    if (rpcError) {
      setError(`Failed to process swap: ${rpcError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/stock-adjustments')
    router.refresh()
  }

  // Previews
  const currentOut = Number(partOut?.stock_quantity) || 0
  const resultingOut = currentOut - (Number(qtyOut) || 0)
  
  const currentIn = Number(partIn?.stock_quantity) || 0
  const resultingIn = currentIn + (Number(qtyIn) || 0)

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/stock-adjustments" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <RefreshCcw size={28} className="text-purple-600" />
            Stock Swap
          </h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SWAP OUT */}
        <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
            <h3 className="font-bold text-red-800">ITEM OUT (Decrease)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8">
              <label className="block text-sm font-medium text-slate-700 mb-1">Part / Material *</label>
              <PartSearchSelector 
                selectedPartId={partOutId} 
                setSelectedPartId={setPartOutId} 
                onSelectPart={setPartOut}
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Qty Out *</label>
              <div className="flex items-center gap-4">
                <input 
                  required
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={qtyOut}
                  onChange={e => setQtyOut(e.target.value)}
                  className="w-full border border-red-300 rounded-md p-2 font-bold text-lg text-red-700 text-center"
                />
                <div className="text-right whitespace-nowrap min-w-[80px]">
                  <div className="text-xs font-bold text-slate-400">RESULT</div>
                  <div className={`font-bold text-xl ${resultingOut < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {partOut ? resultingOut : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SWAP IN */}
        <div className="bg-white border border-green-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-green-100 bg-green-50 flex justify-between items-center">
            <h3 className="font-bold text-green-800">ITEM IN (Increase)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8">
              <label className="block text-sm font-medium text-slate-700 mb-1">Part / Material *</label>
              <PartSearchSelector 
                selectedPartId={partInId} 
                setSelectedPartId={setPartInId} 
                onSelectPart={setPartIn}
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Qty In *</label>
              <div className="flex items-center gap-4">
                <input 
                  required
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={qtyIn}
                  onChange={e => setQtyIn(e.target.value)}
                  className="w-full border border-green-300 rounded-md p-2 font-bold text-lg text-green-700 text-center"
                />
                <div className="text-right whitespace-nowrap min-w-[80px]">
                  <div className="text-xs font-bold text-slate-400">RESULT</div>
                  <div className="font-bold text-xl text-slate-800">
                    {partIn ? resultingIn : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REASON & SAVE */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes *</label>
              <input 
                required
                type="text" 
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2"
                placeholder="e.g., Customer exchanged defective filter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
              <input 
                type="text" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Link 
              href="/stock-adjustments"
              className="px-6 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting || resultingOut < 0}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-8 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
            >
              <Save size={18} />
              {isSubmitting ? 'Processing...' : 'Save Swap'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
