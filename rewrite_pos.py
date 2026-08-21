import re

content = """'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, X, Printer, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { createPortal } from 'react-dom'

const ItemsModal = ({ transaction, onClose }: { transaction: any, onClose: () => void }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const totalAmount = Number(transaction.total_amount) || 0

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Items in {transaction.po_number}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-0 max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium text-right">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Unit Cost</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.purchase_order_items?.map((item: any, i: number) => {
                const qty = Number(item.qty_ordered) || 0
                const cost = Number(item.unit_cost) || 0
                const amount = Number(item.total_amount) || (qty * cost)
                
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">{item.parts?.name || 'Unknown Item'}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-800">{qty}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-600">
                      ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-slate-800">
                      ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
          <span className="text-slate-600 font-medium mr-4">Total:</span>
          <span className="text-xl font-bold text-slate-800">
            ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function PurchaseOrdersPage() {
  const supabase = createClient()
  
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name), purchase_order_items(qty_ordered, unit_cost, total_amount, parts(name))')
      .order('created_at', { ascending: false })
      
    if (data) setPurchaseOrders(data)
    setIsLoading(false)
  }

  const filtered = purchaseOrders.filter(po => {
    const q = searchQuery.toLowerCase()
    return (
      (po.po_number && po.po_number.toLowerCase().includes(q)) ||
      (po.suppliers?.name && po.suppliers.name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Purchase Orders</h1>
          <p className="text-slate-500 mt-1">Manage orders from suppliers and receive inventory.</p>
        </div>
        <Link 
          href="/purchase-orders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> New Purchase Order
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4 shrink-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search PO number, supplier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium">PO NUMBER</th>
                <th className="px-6 py-3 font-medium">SUPPLIER</th>
                <th className="px-6 py-3 font-medium">ORDER DATE</th>
                <th className="px-6 py-3 font-medium">STATUS</th>
                <th className="px-6 py-3 font-medium text-right">ITEMS</th>
                <th className="px-6 py-3 font-medium text-right">AMOUNT</th>
                <th className="px-6 py-3 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-6 w-24 bg-slate-200 rounded mb-4"></div>
                      <div className="text-sm">Loading purchase orders...</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filtered.map(po => {
                  const items = po.purchase_order_items || []
                  const numItems = items.length
                  const totalAmount = Number(po.total_amount) || 0

                  return (
                    <tr key={po.id} className="hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 last:border-0" onClick={() => window.location.href = `/purchase-orders/${po.id}`}>
                      <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                        <Link href={`/purchase-orders/${po.id}`}>{po.po_number}</Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {po.suppliers?.name || 'Unknown Supplier'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {format(new Date(po.order_date || po.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                          po.status === 'PARTIALLY RECEIVED' ? 'bg-blue-100 text-blue-700' :
                          po.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedTransaction(po); }}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                        >
                          {numItems}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/purchase-orders/${po.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye size={16} /> View
                          </Link>
                          <Link 
                            href={`/print/purchase-orders/${po.id}`}
                            className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Printer size={16} /> Print
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedTransaction && (
        <ItemsModal 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </div>
  )
}
"""

with open('src/app/(dashboard)/purchase-orders/page.tsx', 'w') as f:
    f.write(content)

