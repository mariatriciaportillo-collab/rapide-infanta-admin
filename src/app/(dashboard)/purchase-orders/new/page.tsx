'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from 'lucide-react'
import { PartSearchSelector } from '@/components/parts/PartSearchSelector'
import { SupplierSearchSelector } from '@/components/suppliers/SupplierSearchSelector'

type POItem = {
  id: string
  partId: string
  part: any
  qty: string
  unitCost: string
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  
  const [items, setItems] = useState<POItem[]>([
    { id: 'initial-row-1', partId: '', part: null, qty: '', unitCost: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Post-save shortcut state
  const [savedPoId, setSavedPoId] = useState<string | null>(null)
  const [savedPoNumber, setSavedPoNumber] = useState<string | null>(null)

  useEffect(() => {
    setOrderDate(new Date().toISOString().split('T')[0])
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('id, name').eq('is_active', true).order('name')
    if (data) setSuppliers(data)
  }

  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partId: '', part: null, qty: '', unitCost: '' }])
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(item => item.id !== id) : prev)
  }

  const handleUpdateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'part' && value) {
          updated.partId = value.id
          updated.unitCost = value.cost || '0'
        }
        return updated
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!supplierId) {
      setError('Please select a supplier.')
      setIsSubmitting(false)
      return
    }

    const validItems = items.filter(i => i.partId && Number(i.qty) > 0)
    if (validItems.length === 0) {
      setError('Please add at least one valid item with a quantity greater than 0.')
      setIsSubmitting(false)
      return
    }

    // Prepare items array
    const rpcItems = validItems.map(i => ({
      part_id: i.partId,
      qty: Number(i.qty),
      unit_cost: Number(i.unitCost) || 0,
      total_amount: (Number(i.qty) * (Number(i.unitCost) || 0))
    }))

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    const { data, error: rpcError } = await supabase.rpc('create_purchase_order', {
      p_supplier_id: supplierId || null,
      p_order_date: orderDate || null,
      p_expected_date: expectedDate || null,
      p_reference: reference || null,
      p_notes: notes || null,
      p_terms: terms || null,
      p_items: rpcItems,
      p_user_id: userId || null
    })

    if (rpcError) {
      setError(rpcError.message)
      setIsSubmitting(false)
    } else if (data) {
      // data contains the UUID of the newly created PO
      const { data: poData } = await supabase.from('purchase_orders').select('po_number').eq('id', data).single()
      setSavedPoId(data)
      setSavedPoNumber(poData?.po_number || 'Unknown')
      setIsSubmitting(false)
    }
  }

  // Calculate Totals
  const totalItems = items.filter(i => i.partId).length
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.unitCost || 0)), 0)

  if (savedPoId) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Purchase Order Created</h2>
        <p className="text-slate-600 mb-8">{savedPoNumber} has been created successfully.</p>
        
        <div className="space-y-3">
          <Link 
            href={`/purchase-orders/${savedPoId}/receive`}
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition"
          >
            Receive Items Now
          </Link>
          <Link 
            href={`/purchase-orders/${savedPoId}`}
            className="block w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-bold transition"
          >
            View Purchase Order
          </Link>
          <Link 
            href="/purchase-orders"
            className="block w-full py-3 text-slate-500 hover:text-slate-700 font-medium transition"
          >
            Back to Purchase Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/purchase-orders" className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">New Purchase Order</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-start gap-2 border border-red-200">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier *</label>
              <SupplierSearchSelector 
                selectedSupplierId={supplierId}
                setSelectedSupplierId={setSupplierId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Order Date *</label>
              <input 
                required
                type="date" 
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Delivery Date</label>
              <input 
                type="date" 
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
              <input 
                type="text" 
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="Quote No., Supplier Ref..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms</label>
              <input 
                type="text" 
                value={terms}
                onChange={e => setTerms(e.target.value)}
                placeholder="e.g. Net 30, COD"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Order Items</h2>
          <div className="space-y-4">
            {items.map((item, index) => {
              const qtyNum = Number(item.qty) || 0
              const costNum = Number(item.unitCost) || 0
              const lineTotal = qtyNum * costNum

              return (
                <div key={item.id} className="p-4 rounded-lg border bg-slate-50 border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-700">Line {index + 1}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded transition disabled:opacity-50"
                      disabled={items.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Part / Material *</label>
                      <PartSearchSelector 
                        selectedPartId={item.partId} 
                        setSelectedPartId={(id) => handleUpdateItem(item.id, 'partId', id)} 
                        onSelectPart={(p) => handleUpdateItem(item.id, 'part', p)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Qty Ordered *</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        min="0.01"
                        value={item.qty}
                        onChange={e => handleUpdateItem(item.id, 'qty', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Unit Cost (₱)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={e => handleUpdateItem(item.id, 'unitCost', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2 text-right">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Line Total</label>
                      <div className="font-bold text-lg text-slate-800 pt-1">
                        ₱{lineTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}
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

        <div className="bg-slate-800 text-white p-6 rounded-lg shadow-sm border border-slate-700 flex flex-col md:flex-row justify-between items-center">
          <div>
            <div className="text-slate-400 font-medium">Order Summary</div>
            <div className="text-sm mt-1 text-slate-300">Total Items: {totalItems}</div>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="text-slate-400 font-medium mb-1">Grand Total</div>
            <div className="text-3xl font-bold">
              ₱{totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Save size={24} />
          {isSubmitting ? 'Saving Order...' : 'Save Purchase Order'}
        </button>
      </form>

    </div>
  )
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
