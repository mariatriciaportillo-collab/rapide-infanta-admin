'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Settings, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'

export default function StockAdjustmentsPage() {
  const supabase = createClient()
  
  const [movements, setMovements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchAdjustments()
  }, [])

  const fetchAdjustments = async () => {
    setIsLoading(true)
    // Fetch only manual adjustment types and opening balance
    const { data } = await supabase
      .from('inventory_movements')
      .select('*, parts(name, part_number, unit)')
      .in('movement_type', ['POSITIVE_ADJUSTMENT', 'NEGATIVE_ADJUSTMENT', 'OPENING_BALANCE'])
      .order('created_at', { ascending: false })
      
    if (data) setMovements(data)
    setIsLoading(false)
  }

  const filteredMovements = movements.filter(m => {
    // Search
    const q = searchQuery.toLowerCase()
    const partName = m.parts?.name?.toLowerCase() || ''
    const partNo = m.parts?.part_number?.toLowerCase() || ''
    const reason = m.reference_type?.toLowerCase() || ''
    const notes = m.notes?.toLowerCase() || ''
    
    const matchesSearch = 
      partName.includes(q) || 
      partNo.includes(q) || 
      reason.includes(q) || 
      notes.includes(q)
      
    // Type Status
    let matchesType = true
    if (typeFilter === 'increase') matchesType = Number(m.quantity) > 0
    else if (typeFilter === 'decrease') matchesType = Number(m.quantity) < 0

    return matchesSearch && matchesType
  })

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Stock Adjustments</h1>
          <p className="text-slate-500 mt-1">Manual corrections and opening balances</p>
        </div>
        <Link 
          href="/stock-adjustments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          New Adjustment
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search part, reason, notes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded-md py-2 pl-3 pr-8 bg-white text-sm"
              >
                <option value="all">All Adjustments</option>
                <option value="increase">Increases Only</option>
                <option value="decrease">Decreases Only</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium">DATE</th>
                <th className="px-6 py-3 font-medium">PART / PRODUCT</th>
                <th className="px-6 py-3 font-medium">REASON</th>
                <th className="px-6 py-3 font-medium text-right">QTY</th>
                <th className="px-6 py-3 font-medium">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="animate-pulse text-slate-300" size={32} /></div>
                    Loading adjustments...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="text-slate-300" size={32} /></div>
                    No adjustments found.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(m => {
                  const qty = Number(m.quantity)
                  const isPositive = qty > 0
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {format(new Date(m.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/inventory/${m.part_id}`} className="font-medium text-blue-600 hover:underline">
                          {m.parts?.name}
                        </Link>
                        {m.parts?.part_number && (
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{m.parts.part_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {m.reference_type || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isPositive ? '+' : ''}{qty} <span className="text-xs font-normal opacity-70">{m.parts?.unit}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={m.notes}>
                        {m.notes || '—'}
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
