'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Settings, RefreshCcw, X } from 'lucide-react'
import { format } from 'date-fns'
import { createPortal } from 'react-dom'

const ItemsModal = ({ transaction, onClose }: { transaction: any, onClose: () => void }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Items in {transaction.reference_number}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-0 max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium text-right">Adjustment</th>
                <th className="px-6 py-3 font-medium text-right">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Unit Cost</th>
                <th className="px-6 py-3 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.inventory_movements?.map((m: any, i: number) => {
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

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('inventory_transactions')
      .select('*, inventory_movements(quantity, unit_cost, movement_type, parts(name))')
      .in('type', ['ADJUSTMENT', 'SWAP'])
      .order('created_at', { ascending: false })
      
    if (data) setTransactions(data)
    setIsLoading(false)
  }

  const filtered = transactions.filter(t => {
    const q = searchQuery.toLowerCase()
    return (
      (t.reference_number && t.reference_number.toLowerCase().includes(q)) ||
      (t.reason && t.reason.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    )
  })

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

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="animate-pulse text-slate-300" size={32} /></div>
                    Loading transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="text-slate-300" size={32} /></div>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
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
