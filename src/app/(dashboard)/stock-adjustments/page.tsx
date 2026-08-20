'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Settings, RefreshCcw } from 'lucide-react'
import { format } from 'date-fns'

export default function StockAdjustmentsPage() {
  const supabase = createClient()
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('inventory_transactions')
      .select('*, inventory_movements(quantity, movement_type)')
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
                <th className="px-6 py-3 font-medium">TYPE</th>
                <th className="px-6 py-3 font-medium">REASON</th>
                <th className="px-6 py-3 font-medium text-center">ITEMS</th>
                <th className="px-6 py-3 font-medium text-center">INCREASES</th>
                <th className="px-6 py-3 font-medium text-center">DECREASES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="animate-pulse text-slate-300" size={32} /></div>
                    Loading transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="text-slate-300" size={32} /></div>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
                  const movements = t.inventory_movements || []
                  const numItems = movements.length
                  const increases = movements.filter((m: any) => Number(m.quantity) > 0).length
                  const decreases = movements.filter((m: any) => Number(m.quantity) < 0).length
                  const isSwap = t.type === 'SWAP'
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = `/stock-adjustments/${t.id}`}>
                      <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                        <Link href={`/stock-adjustments/${t.id}`}>{t.reference_number}</Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {format(new Date(t.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isSwap ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {t.reason || '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">
                        {numItems} {numItems === 1 ? 'Item' : 'Items'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-green-600">
                        {increases > 0 ? `${increases}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-red-600">
                        {decreases > 0 ? `${decreases}` : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
