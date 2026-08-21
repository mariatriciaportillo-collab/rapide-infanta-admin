import re

content = """'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, User, Calendar, FileText, CheckCircle, Building2, Package, Truck, Info, CreditCard, Printer } from 'lucide-react'
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
  
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.qty_ordered) * Number(item.unit_cost)), 0)
  
  const hasVehicle = po.has_vehicle_details === true
  const tax = po.tax_treatment || 'NON_VAT'
  
  let displaySubtotal = rawSubtotal
  let vatableAmount = rawSubtotal
  let vatAmount = 0
  let displayTotal = rawSubtotal
  
  if (tax === 'VAT_INCLUSIVE') {
    vatableAmount = rawSubtotal / 1.12
    vatAmount = rawSubtotal - vatableAmount
    displaySubtotal = vatableAmount
    displayTotal = rawSubtotal
  } else if (tax === 'VAT_EXCLUSIVE') {
    vatAmount = rawSubtotal * 0.12
    displayTotal = rawSubtotal + vatAmount
  }

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
        
        <div className="flex gap-3">
          <Link 
            href={`/print/purchase-orders/${po.id}`}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Printer size={20} /> Print
          </Link>
          {!isReceived && !isCancelled && (
            <Link 
              href={`/purchase-orders/${po.id}/receive`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Package size={20} /> 
              {isPartiallyReceived ? 'Receive Remaining' : 'Receive Items'}
            </Link>
          )}
        </div>
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
              <div className="font-medium text-slate-800">{format(new Date(po.order_date || po.created_at), 'MMMM d, yyyy')}</div>
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
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Info size={14} /> Tax Treatment</div>
              <div className="font-medium text-slate-800">
                {tax === 'VAT_INCLUSIVE' ? 'VAT Inclusive' : tax === 'VAT_EXCLUSIVE' ? 'VAT Exclusive' : 'Non-VAT'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Progress</div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-3xl font-black text-slate-800">{totalQtyReceived}</div>
              <div className="text-sm font-medium text-slate-500">Items Received</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-400">/ {totalQtyOrdered}</div>
              <div className="text-sm font-medium text-slate-400">Total Ordered</div>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-1 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${isReceived ? 'bg-green-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min(100, (totalQtyReceived / Math.max(1, totalQtyOrdered)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Order Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-xs uppercase border-b border-slate-200 font-bold">
                {hasVehicle && <th className="px-6 py-4">Vehicle / Unit</th>}
                <th className="px-6 py-4">Item / Description</th>
                <th className="px-6 py-4">Part No.</th>
                <th className="px-6 py-4 text-center">Ordered</th>
                <th className="px-6 py-4 text-center">Received</th>
                <th className="px-6 py-4 text-right">Unit Cost</th>
                <th className="px-6 py-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  {hasVehicle && (
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.manual_vehicle || '—'}</div>
                      <div className="text-xs font-mono text-slate-500">{item.chassis_number || ''}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 font-medium text-slate-800">{item.parts?.name || 'Unknown Item'}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.parts?.part_number || '—'}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-800">{item.qty_ordered}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                      Number(item.qty_received) >= Number(item.qty_ordered) ? 'bg-green-100 text-green-700' :
                      Number(item.qty_received) > 0 ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.qty_received}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">
                    ₱{Number(item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    ₱{Number(item.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <div className="w-80">
            {tax !== 'NON_VAT' && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium text-sm">{tax === 'VAT_INCLUSIVE' ? 'Subtotal / VATable Amount' : 'Subtotal'}</span>
                  <span className="text-slate-800 font-bold text-sm">
                    ₱{displaySubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium text-sm">VAT (12%)</span>
                  <span className="text-slate-800 font-bold text-sm">
                    ₱{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
            {tax === 'NON_VAT' && (
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium text-sm">Subtotal</span>
                <span className="text-slate-800 font-bold text-sm">
                  ₱{rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-b-2 border-slate-800 mt-2">
              <span className="text-slate-800 font-black text-lg">TOTAL AMOUNT</span>
              <span className="text-slate-900 font-black text-lg">
                ₱{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {po.notes && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-2">Notes</h3>
          <p className="text-slate-600 text-sm whitespace-pre-wrap">{po.notes}</p>
        </div>
      )}
    </div>
  )
}
"""

with open('src/app/(dashboard)/purchase-orders/[id]/PurchaseOrderDetailClient.tsx', 'w') as f:
    f.write(content)

