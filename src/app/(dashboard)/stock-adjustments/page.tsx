'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Settings, RefreshCcw, X } from 'lucide-react'
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

  const movements = transaction.inventory_movements || []

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Transaction Items</h3>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{transaction.reference_number}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-bold border-b border-slate-200">Product</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Direction</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Qty</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Unit Cost</th>
                <th className="px-6 py-3 font-bold border-b border-slate-200 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m: any, i: number) => {
                const qty = Number(m.quantity) || 0
                const cost = Number(m.unit_cost) || 0
                const val = Math.abs(qty) * cost
                const direction = qty > 0 ? 'Increase' : qty < 0 ? 'Decrease' : 'None'
                const sign = qty > 0 ? '+' : ''
                
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">{m.parts?.name || 'Unknown Product'}</td>
                    <td className="px-6 py-3 text-sm text-right text-slate-600">{direction}</td>
                    <td className={`px-6 py-3 text-sm text-right font-medium ${qty > 0 ? 'text-green-600' : qty < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {sign}{qty}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-slate-600">
                      ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-slate-800">
                      ₱{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function StockAdjustmentsPage() {
  const supabase = createClient()
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('inventory_transactions')
      .select('*, inventory_movements(quantity, unit_cost, movement_type, parts(name))', { count: 'exact' })
      .in('type', ['ADJUSTMENT', 'SWAP'])
      .order('created_at', { ascending: false })
      
    if (searchQuery.trim()) {
      const q = searchQuery.trim()
      query = query.or(`reference_number.ilike.%${q}%,reason.ilike.%${q}%,notes.ilike.%${q}%`)
    }

    // Apply Pagination Range
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)
      
    const { data, count, error } = await query
    
    if (!error && data) {
      setTransactions(data)
      setTotalCount(count || 0)
    } else {
      console.error("Failed to fetch transactions:", error)
      setTransactions([])
      setTotalCount(0)
    }
    
    setIsLoading(false)
  }, [supabase, searchQuery, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchTransactions])

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Stock Adjustments</h1>
          <p className="text-slate-500 mt-1">Multi-item corrections and inventory swaps</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/stock-swaps/new"
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
          >
            <RefreshCcw size={18} />
            New Swap
          </Link>
          <Link 
            href="/stock-adjustments/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            New Adjustment
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0 rounded-t-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ref no, reason, notes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="flex flex-col items-center text-slate-500 gap-3">
              <Settings className="animate-pulse text-slate-300" size={40} />
              <span className="font-medium">Loading transactions...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="px-6 py-3 font-medium">ADJUSTMENT NO.</th>
                    <th className="px-6 py-3 font-medium">DATE</th>
                    <th className="px-6 py-3 font-medium">REASON</th>
                    <th className="px-6 py-3 font-medium text-right">ITEMS</th>
                    <th className="px-6 py-3 font-medium text-right">VALUE</th>
                    <th className="px-6 py-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><Settings className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No transactions found.</p>
                      </td>
                    </tr>
                  ) : (
                    transactions.map(t => {
                      const movements = t.inventory_movements || []
                      const numItems = movements.length
                      
                      const totalValue = movements.reduce((sum: number, m: any) => {
                        const qty = Math.abs(Number(m.quantity) || 0)
                        const cost = Number(m.unit_cost) || 0
                        return sum + (qty * cost)
                      }, 0)
                      
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {t.reference_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {format(new Date(t.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {t.reason || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              type="button"
                              onClick={(e) => { e.preventDefault(); setSelectedTransaction(t); }}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                            >
                              {numItems}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">
                            ₱{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <Link 
                              href={t.type === 'SWAP' ? `/stock-swaps/${t.id}` : `/stock-adjustments/${t.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
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
