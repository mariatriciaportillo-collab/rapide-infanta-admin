'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, User, Calendar, FileText, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export function StockAdjustmentDetailClient({ id }: { id: string }) {
  const supabase = createClient()
  
  const [adjustment, setAdjustment] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch adjustment
    const { data: adjData } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('id', id)
      .eq('type', 'ADJUSTMENT')
      .single()
      
    if (adjData) {
      setAdjustment(adjData)
      
      // Fetch items
      const { data: itemData } = await supabase
        .from('inventory_movements')
        .select('*, parts(name, part_number, unit, stock_quantity)')
        .eq('transaction_id', id)
        .order('id')
        
      if (itemData) setItems(itemData)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading stock adjustment...</div>
  }

  if (!adjustment) {
    return <div className="p-8 text-center text-slate-500">Stock Adjustment not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/stock-adjustments" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">{adjustment.reference_number}</h2>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-green-200">
          <CheckCircle size={16} /> Completed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar size={14} /> Date & Time</div>
            <div className="font-medium text-slate-800">{format(new Date(adjustment.created_at), 'MMMM d, yyyy h:mm a')}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FileText size={14} /> Reason</div>
            <div className="font-medium text-slate-800">{adjustment.reason}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><User size={14} /> Created By</div>
            <div className="font-medium text-slate-800 text-sm">{adjustment.created_by || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FileText size={14} /> Notes</div>
            <div className="text-slate-600">{adjustment.notes || 'None'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Adjusted Items ({items.length})</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-3">Part / Material</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => {
              const change = Number(item.quantity)
              const unit = item.parts?.unit || 'pcs'
              const isPositive = change > 0
              
              // Note: Since historical stock isn't saved per-row, we display current parts stock as a proxy for the resulting stock if it's recent, or we just show the adjustment.
              const currentStock = Number(item.parts?.stock_quantity) || 0
              const prev = currentStock - change

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.parts?.name || 'Unknown Part'}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-mono">{item.parts?.part_number || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isPositive ? 'Increase Stock' : 'Decrease Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {isPositive ? '+' : ''}{change} {unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="flex items-center justify-end gap-2 text-sm font-medium">
                      <span className="text-slate-400">{prev}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-slate-800 font-bold">{currentStock}</span>
                    </span>
                  </td>
                </tr>
              )
            })}
            
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No items found in this adjustment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
