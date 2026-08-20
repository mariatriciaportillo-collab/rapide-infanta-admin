'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'

export default function PurchaseOrdersPage() {
  const supabase = createClient()
  
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name)')
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
    <div className="max-w-6xl mx-auto pb-24">
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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search PO number, supplier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium">
            <Filter size={18} /> Filter
          </button>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 border-b border-slate-200 shadow-sm">
              <tr className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-6 w-24 bg-slate-200 rounded mb-4"></div>
                      <div className="text-sm">Loading purchase orders...</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filtered.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = `/purchase-orders/${po.id}`}>
                    <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                      <Link href={`/purchase-orders/${po.id}`}>{po.po_number}</Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {po.suppliers?.name || 'Unknown Supplier'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {format(new Date(po.order_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                        po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                        po.status === 'PARTIALLY RECEIVED' ? 'bg-blue-100 text-blue-700' :
                        po.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ₱{Number(po.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
