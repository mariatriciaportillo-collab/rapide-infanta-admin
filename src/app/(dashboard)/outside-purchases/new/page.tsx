'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'

type OPItem = {
  id: string
  partId: string
  part: any
  qty: string
  unitCost: string
  inventoryTreatment: 'ADD_TO_INVENTORY' | 'DIRECT_USE'
}

export default function NewOutsidePurchasePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<any[]>([])
  
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [notes, setNotes] = useState('')
  
  const [items, setItems] = useState<OPItem[]>([
    { id: 'initial-row-1', partId: '', part: null, qty: '', unitCost: '', inventoryTreatment: 'ADD_TO_INVENTORY' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPurchaseDate(new Date().toISOString().split('T')[0])
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('id, name').eq('is_active', true).order('name')
    if (data) setSuppliers(data)
  }

  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '', inventoryTreatment: 'ADD_TO_INVENTORY' }])
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev)
  }

  const handleUpdateItem = (id: string, field: keyof OPItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        if (field === 'part' && value) {
          return { ...item, part: value, unitCost: item.unitCost ? item.unitCost : (value.cost ? value.cost.toString() : '') }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!supplierId) {
      setError("Supplier is required.")
      setIsSubmitting(false)
      return
    }

    if (!purchaseDate) {
      setError("Please select a Purchase Date.")
      setIsSubmitting(false)
      return
    }

    // Validation
    const processedItems: any[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.partId) {
        setError(`Part / Material is required for line ${i + 1}.`)
        setIsSubmitting(false)
        return
      }

      const qtyNum = Number(item.qty)
      if (!qtyNum || qtyNum <= 0) {
        setError(`Please enter a valid quantity for ${item.part?.name || `line ${i + 1}`}.`)
        setIsSubmitting(false)
        return
      }

      const costNum = Number(item.unitCost)
      if (isNaN(costNum) || costNum < 0) {
        setError(`Please enter a valid unit cost for ${item.part?.name || `line ${i + 1}`}.`)
        setIsSubmitting(false)
        return
      }

      processedItems.push({
        part_id: item.partId,
        qty: qtyNum,
        unit_cost: costNum,
        total_amount: qtyNum * costNum,
        inventory_treatment: item.inventoryTreatment
      })
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Call RPC
    const { data, error: rpcError } = await supabase.rpc('process_outside_purchase', {
      p_supplier_id: supplierId,
      p_purchase_date: purchaseDate,
      p_receipt_number: receiptNumber.trim() || null,
      p_notes: notes.trim() || null,
      p_items: processedItems,
      p_user_id: user?.id || null
    })

    if (rpcError) {
      setError(`Failed to save outside purchase: ${rpcError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/outside-purchases')
    router.refresh()
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitCost) || 0), 0)
  const totalItems = items.filter(i => i.partId).length

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/outside-purchases" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">New Outside Purchase</h2>
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
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">PURCHASE DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
                <select 
                  required
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 bg-white"
                >
                  <option value="" disabled>Select supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date *</label>
                <input 
                  required
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt / Reference No.</label>
                <input 
                  type="text"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2" 
                  placeholder="e.g. INV-2026-08"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input 
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2" 
                  placeholder="Optional details..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">ITEMS ({items.length})</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {items.map((item, index) => {
                const lineTotal = (Number(item.qty) || 0) * (Number(item.unitCost) || 0)

                return (
                  <div key={item.id} className="p-4 rounded-lg border bg-slate-50 border-slate-200 relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400">LINE {index + 1}</span>
                      {items.length > 1 && (
                        <TableAction 
                            icon={Trash2} 
                            label="Remove Item" 
                            onClick={() => handleRemoveItem(item.id)} 
                            variant="destructive" 
                          />
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

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Qty *</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          min="0.01"
                          value={item.qty}
                          onChange={e => handleUpdateItem(item.id, 'qty', e.target.value)}
                          className="w-full border rounded-md py-1.5 px-2 font-bold text-slate-800 border-slate-300"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Unit Cost *</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleUpdateItem(item.id, 'unitCost', e.target.value)}
                          className="w-full border rounded-md py-1.5 px-2 font-bold text-slate-800 border-slate-300"
                        />
                      </div>

                      <div className="md:col-span-3 text-right pb-1">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Line Total</div>
                        <div className="font-bold text-lg text-slate-800">
                          ₱{lineTotal.toFixed(2)}
                        </div>
                      </div>

                      <div className="md:col-span-12 mt-2 pt-2 border-t border-slate-200">
                        <label className="block text-xs font-medium text-slate-500 mb-2">Inventory Treatment *</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                              type="radio" 
                              name={`treatment-${item.id}`}
                              checked={item.inventoryTreatment === 'ADD_TO_INVENTORY'}
                              onChange={() => handleUpdateItem(item.id, 'inventoryTreatment', 'ADD_TO_INVENTORY')}
                              className="text-blue-600"
                            />
                            <span className="font-medium text-slate-700">Add to Inventory</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                              type="radio" 
                              name={`treatment-${item.id}`}
                              checked={item.inventoryTreatment === 'DIRECT_USE'}
                              onChange={() => handleUpdateItem(item.id, 'inventoryTreatment', 'DIRECT_USE')}
                              className="text-slate-600"
                            />
                            <span className="text-slate-600">Direct Use / Non-Stock</span>
                          </label>
                        </div>
                      </div>
                    </div>
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
            <h3 className="text-sm font-bold text-slate-400 tracking-wider mb-6 text-center uppercase">Purchase Summary</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-slate-600 font-medium">Total Items</span>
                <span className="text-2xl font-bold text-slate-800">{totalItems}</span>
              </div>

              <div className="flex justify-between items-end pb-2">
                <span className="text-slate-800 font-bold text-lg">Total Amount</span>
                <span className="text-3xl font-black text-blue-700">
                  ₱{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-md font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Save size={20} />
                {isSubmitting ? 'Saving Transaction...' : 'Save Purchase'}
              </button>
              <Link 
                href="/outside-purchases"
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
