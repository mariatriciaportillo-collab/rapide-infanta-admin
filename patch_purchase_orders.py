import re

content = """'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, X, Eye, Printer, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { createPortal } from 'react-dom'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 25

// Simple Modal Component
function ItemsModal({ transaction, onClose }: { transaction: any, onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const items = transaction.purchase_order_items || []
  const rawSubtotal = items.reduce((sum: number, item: any) => sum + ((Number(item.qty_ordered) || 0) * (Number(item.unit_cost) || 0)), 0)
  const tax = transaction.tax_treatment || 'NON_VAT'
  let displayTotal = rawSubtotal
  if (tax === 'VAT_EXCLUSIVE') {
    displayTotal = rawSubtotal * 1.12
  }

  // Determine if this PO has vehicle specific columns
  const hasVehicles = items.some((i: any) => i.manual_vehicle || i.chassis_number)

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">PO Items Overview</h3>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{transaction.po_number}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-0 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider sticky top-0 shadow-sm">
                {hasVehicles && <th className="px-6 py-3 font-bold border-b border-slate-200">Vehicle</th>}
                {hasVehicles && <th className="px-6 py-3 font-bold border-b border-slate-200">Chassis No.</th>}
                <th className="px-6 py-3 font-bold border-b border-slate-200">Item</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200">Part No.</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Qty</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Unit Cost</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any, i: number) => {
                const qty = Number(item.qty_ordered) || 0
                const cost = Number(item.unit_cost) || 0
                const amount = qty * cost
                
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    {hasVehicles && <td className="px-6 py-3 text-sm text-slate-700">{item.manual_vehicle || '—'}</td>}
                    {hasVehicles && <td className="px-6 py-3 text-sm text-slate-500 font-mono">{item.chassis_number || '—'}</td>}
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">{item.parts?.name || 'Unknown Item'}</td>
                    <td className="px-6 py-3 text-sm text-slate-500 font-mono">{item.parts?.part_number || '—'}</td>
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <span className="text-slate-600 font-medium mr-4">Total Amount:</span>
          <span className="text-xl font-bold text-slate-800">
            ₱{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('purchase_orders')
      .select('*, suppliers(name), purchase_order_items(qty_ordered, unit_cost, total_amount, manual_vehicle, chassis_number, parts(name, part_number))', { count: 'exact' })
      .order('created_at', { ascending: false })
      
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      let orParts = [`po_number.ilike.%${q}%`]
      
      const { data: suppliers } = await supabase.from('suppliers').select('id').ilike('name', `%${q}%`)
      if (suppliers && suppliers.length > 0) {
        orParts.push(`supplier_id.in.(${suppliers.map(s => s.id).join(',')})`)
      }
      
      query = query.or(orParts.join(','))
    }

    // Apply Pagination Range
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    
    if (!error && data) {
      setPurchaseOrders(data)
      setTotalCount(count || 0)
    } else {
      console.error("Failed to fetch purchase orders:", error)
      setPurchaseOrders([])
      setTotalCount(0)
    }
    
    setIsLoading(false)
  }, [supabase, searchQuery, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchaseOrders()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchPurchaseOrders])

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

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

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4 shrink-0 rounded-t-lg">
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

        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="flex flex-col items-center text-slate-500 gap-3">
              <FileText className="animate-pulse text-slate-300" size={40} />
              <span className="font-medium">Loading purchase orders...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
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
                  {purchaseOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><FileText className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No purchase orders found.</p>
                      </td>
                    </tr>
                  ) : (
                    purchaseOrders.map(po => {
                      const items = po.purchase_order_items || []
                      const numItems = items.length
                      
                      const rawSubtotal = items.reduce((sum: number, item: any) => sum + ((Number(item.qty_ordered) || 0) * (Number(item.unit_cost) || 0)), 0)
                      const tax = po.tax_treatment || 'NON_VAT'
                      let totalAmount = rawSubtotal
                      if (tax === 'VAT_EXCLUSIVE') {
                        totalAmount = rawSubtotal * 1.12
                      }

                      return (
                        <tr key={po.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {po.po_number}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {po.suppliers?.name || 'Unknown Supplier'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {format(new Date(po.order_date || po.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${
                              po.status === 'RECEIVED' ? 'bg-green-50 text-green-700 border-green-200' :
                              po.status === 'PARTIALLY RECEIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              po.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-orange-50 text-orange-700 border-orange-200'
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
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye size={16} /> View
                              </Link>
                              <Link 
                                href={`/print/purchase-orders/${po.id}`}
                                className="text-sm font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-md transition"
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

            {totalCount > 0 && (
              <Pagination 
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                currentPage={page}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}
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
