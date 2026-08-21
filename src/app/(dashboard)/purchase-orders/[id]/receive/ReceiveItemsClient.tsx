'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Building2, Calendar, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

type RcvItem = {
  po_item_id: string
  part_id: string
  part_name: string
  part_number: string
  unit: string
  ordered: number
  previously_received: number
  remaining: number
  receive_now: string
  unit_cost: number
}

export function ReceiveItemsClient({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [po, setPo] = useState<any>(null)
  const [items, setItems] = useState<RcvItem[]>([])
  const [receiveDate, setReceiveDate] = useState('')
  const [supplierRef, setSupplierRef] = useState('')
  const [notes, setNotes] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successReceiptId, setSuccessReceiptId] = useState<string | null>(null)

  useEffect(() => {
    setReceiveDate(new Date().toISOString().split('T')[0])
    fetchData()
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch PO header
    const { data: poData } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name)')
      .eq('id', id)
      .single()
      
    if (poData) {
      setPo(poData)
      
      // Fetch PO items
      const { data: itemData } = await supabase
        .from('purchase_order_items')
        .select('*, parts(name, part_number, unit)')
        .eq('purchase_order_id', id)
        .order('id')
        
      if (itemData) {
        const unreceived = itemData
          .map(item => {
            const ordered = Number(item.qty_ordered)
            const received = Number(item.qty_received)
            const remaining = ordered - received
            return {
              po_item_id: item.id,
              part_id: item.part_id,
              part_name: item.parts?.name || 'Unknown Part',
              part_number: item.parts?.part_number || '',
              unit: item.parts?.unit || 'pcs',
              ordered: ordered,
              previously_received: received,
              remaining: remaining,
              receive_now: remaining > 0 ? remaining.toString() : '0',
              unit_cost: Number(item.unit_cost)
            }
          })
          .filter(item => item.remaining > 0) // Only show items that still need receiving
          
        setItems(unreceived)
      }
    }

    setIsLoading(false)
  }

  const handleUpdateReceiveNow = (poItemId: string, val: string) => {
    setItems(prev => prev.map(item => {
      if (item.po_item_id === poItemId) {
        return { ...item, receive_now: val }
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate
    let totalRcv = 0
    const rpcItems = []

    for (const item of items) {
      const rcvNum = Number(item.receive_now) || 0
      if (rcvNum < 0) {
        setError(`Cannot receive negative quantities for ${item.part_name}.`)
        setIsSubmitting(false)
        return
      }
      if (rcvNum > item.remaining) {
        setError(`Cannot receive more than the remaining quantity of ${item.remaining} ${item.unit} for ${item.part_name}.`)
        setIsSubmitting(false)
        return
      }
      
      if (rcvNum > 0) {
        totalRcv += rcvNum
        rpcItems.push({
          po_item_id: item.po_item_id,
          part_id: item.part_id,
          qty: rcvNum,
          unit_cost: item.unit_cost,
          total_amount: rcvNum * item.unit_cost
        })
      }
    }

    if (totalRcv === 0) {
      setError('Please enter a quantity greater than 0 for at least one item.')
      setIsSubmitting(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    const { data, error: rpcError } = await supabase.rpc('receive_po_items', {
      p_po_id: id,
      p_receive_date: receiveDate || null,
      p_supplier_ref: supplierRef || null,
      p_notes: notes || null,
      p_items: rpcItems,
      p_user_id: userId || null
    })

    if (rpcError) {
      setError(rpcError.message)
      setIsSubmitting(false)
    } else if (data) {
      setSuccessReceiptId(data)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading purchase order...</div>
  }

  if (!po) {
    return <div className="p-8 text-center text-slate-500">Purchase Order not found.</div>
  }

  if (items.length === 0 && !successReceiptId) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Fully Received</h2>
        <p className="text-slate-600 mb-8">All items for {po.po_number} have already been received.</p>
        <Link 
          href={`/purchase-orders/${id}`}
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
        >
          View Purchase Order
        </Link>
      </div>
    )
  }

  if (successReceiptId) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Items Received Successfully</h2>
        <p className="text-slate-600 mb-8">The inventory has been updated for {po.po_number}.</p>
        <div className="space-y-3">
          <Link 
            href={`/purchase-orders/${id}`}
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition"
          >
            View Purchase Order
          </Link>
        </div>
      </div>
    )
  }

  const totalItemsBeingReceived = items.filter(i => (Number(i.receive_now) || 0) > 0).length
  const totalQtyBeingReceived = items.reduce((sum, item) => sum + (Number(item.receive_now) || 0), 0)

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/purchase-orders/${id}`} className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Receive Items</h1>
          <p className="text-slate-500 font-medium">{po.po_number}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-800 text-white p-6 rounded-lg shadow-sm border border-slate-700">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Building2 size={14} /> Supplier</div>
            <div className="font-bold text-lg">{po.suppliers?.name || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar size={14} /> Order Date</div>
            <div className="font-medium">{format(new Date(po.order_date), 'MMM d, yyyy')}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PO Status</div>
            <div className="font-medium">{po.status}</div>
          </div>
        </div>

        {/* Receiving Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Receiving Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Received Date *</label>
              <input 
                required
                type="date" 
                value={receiveDate}
                onChange={e => setReceiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Ref / Delivery Receipt</label>
              <input 
                type="text" 
                value={supplierRef}
                onChange={e => setSupplierRef(e.target.value)}
                placeholder="DR No., Invoice No."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <input 
                type="text" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional receiving notes..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Items to Receive</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-3">Part / Material</th>
                <th className="px-6 py-3 text-center">Ordered</th>
                <th className="px-6 py-3 text-center">Received</th>
                <th className="px-6 py-3 text-center">Remaining</th>
                <th className="px-6 py-3 text-right">Unit Cost</th>
                <th className="px-6 py-3 text-center w-48">Receive Now</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const isOver = (Number(item.receive_now) || 0) > item.remaining

                return (
                  <tr key={item.po_item_id} className={`transition ${isOver ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{item.part_name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{item.part_number || 'No SKU'}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {item.ordered}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      {item.previously_received}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-orange-600">
                      {item.remaining}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 text-sm">
                      ₱{item.unit_cost.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="number"
                          min="0"
                          max={item.remaining}
                          step="0.01"
                          value={item.receive_now}
                          onChange={(e) => handleUpdateReceiveNow(item.po_item_id, e.target.value)}
                          className={`w-28 px-3 py-2 text-center font-bold text-lg border rounded-md focus:outline-none focus:ring-2 ${
                            isOver 
                              ? 'border-red-400 text-red-600 focus:ring-red-500' 
                              : 'border-slate-300 text-blue-700 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      {isOver && (
                        <div className="text-[10px] font-bold text-red-600 text-center mt-1">
                          Max: {item.remaining}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
            <div className="text-slate-600">
              <span className="font-medium text-slate-800">Summary:</span> {totalItemsBeingReceived} items being received ({totalQtyBeingReceived} total units)
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || items.some(i => (Number(i.receive_now) || 0) > i.remaining)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-sm flex items-center gap-2"
            >
              <Save size={20} />
              {isSubmitting ? 'Receiving...' : 'Receive Items'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
