'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, User, Calendar, FileText, CheckCircle, Building2, Package, Truck, Info, CreditCard } from 'lucide-react'
import { format } from 'date-fns'

export function PurchaseOrderDetailClient({ id }: { id: string }) {
  const supabase = createClient()
  
  const [po, setPo] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
        
      if (itemData) setItems(itemData)

      // Fetch receiving history
      const { data: receiptData } = await supabase
        .from('purchase_receipts')
        .select('*, purchase_receipt_items(qty_received)')
        .eq('purchase_order_id', id)
        .order('created_at', { ascending: false })

      if (receiptData) setReceipts(receiptData)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading purchase order...</div>
  }

  if (!po) {
    return <div className="p-8 text-center text-slate-500">Purchase Order not found.</div>
  }

  const isReceived = po.status === 'RECEIVED'
  const isPartiallyReceived = po.status === 'PARTIALLY RECEIVED'
  const isCancelled = po.status === 'CANCELLED'
  
  const totalQtyOrdered = items.reduce((sum, item) => sum + Number(item.qty_ordered), 0)
  const totalQtyReceived = items.reduce((sum, item) => sum + Number(item.qty_received), 0)

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/purchase-orders" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">{po.po_number}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isReceived ? 'bg-green-100 text-green-700 border border-green-200' :
            isPartiallyReceived ? 'bg-blue-100 text-blue-700 border border-blue-200' :
            isCancelled ? 'bg-red-100 text-red-700 border border-red-200' :
            'bg-orange-100 text-orange-700 border border-orange-200'
          }`}>
            {po.status}
          </span>
        </div>
        
        {!isReceived && !isCancelled && (
          <Link 
            href={`/purchase-orders/${po.id}/receive`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Package size={20} /> 
            {isPartiallyReceived ? 'Receive Remaining Items' : 'Receive Items'}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Building2 size={14} /> Supplier</div>
              <div className="font-bold text-lg text-slate-800">{po.suppliers?.name || 'Unknown Supplier'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar size={14} /> Order Date</div>
              <div className="font-medium text-slate-800">{format(new Date(po.order_date), 'MMMM d, yyyy')}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Truck size={14} /> Expected Del.</div>
              <div className="font-medium text-slate-800">{po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'MMMM d, yyyy') : '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FileText size={14} /> Ref No.</div>
              <div className="font-medium text-slate-800">{po.reference_number || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><CreditCard size={14} /> Terms</div>
              <div className="font-medium text-slate-800">{po.terms || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><User size={14} /> Created By</div>
              <div className="font-medium text-slate-800 text-sm">{po.created_by || 'Unknown'}</div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Info size={14} /> Notes</div>
            <div className="text-slate-600">{po.notes || 'None'}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-center text-white">
          <div className="text-slate-400 font-medium mb-1">Grand Total</div>
          <div className="text-3xl font-bold mb-4">
            ₱{Number(po.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
          </div>
          
          <div className="space-y-2 border-t border-slate-700 pt-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Items</span>
              <span className="font-bold">{items.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ordered Qty</span>
              <span className="font-bold">{totalQtyOrdered}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Received Qty</span>
              <span className={`font-bold ${totalQtyReceived > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                {totalQtyReceived}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Order Items</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-3">Part / Material</th>
              <th className="px-6 py-3 text-center">Ordered</th>
              <th className="px-6 py-3 text-center">Received</th>
              <th className="px-6 py-3 text-center">Remaining</th>
              <th className="px-6 py-3 text-right">Unit Cost</th>
              <th className="px-6 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => {
              const ordered = Number(item.qty_ordered)
              const received = Number(item.qty_received)
              const remaining = ordered - received
              const cost = Number(item.unit_cost)
              const total = Number(item.total_amount)
              const unit = item.parts?.unit || 'pcs'

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{item.parts?.name || 'Unknown Part'}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{item.parts?.part_number || 'No SKU'}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">
                    {ordered} <span className="text-xs font-normal text-slate-400">{unit}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">
                    {received} <span className="text-xs font-normal text-green-400">{unit}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-orange-600">
                    {remaining} <span className="text-xs font-normal text-orange-400">{unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    ₱{cost.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    ₱{total.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Receiving History */}
      {receipts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Receiving History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {receipts.map(receipt => {
              const rcvTotalQty = receipt.purchase_receipt_items?.reduce((sum: number, rcvItem: any) => sum + Number(rcvItem.qty_received), 0) || 0
              
              return (
                <div key={receipt.id} className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50 transition gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-800">{receipt.receipt_number}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {format(new Date(receipt.receive_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {receipt.supplier_reference && (
                      <div className="text-sm text-slate-600">Ref: {receipt.supplier_reference}</div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-slate-500 uppercase tracking-wider font-bold text-xs mb-1">Items Received</div>
                    <div className="font-bold text-xl text-green-600">
                      {rcvTotalQty} <span className="text-sm font-normal text-green-500">pcs</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
