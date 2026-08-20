'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Package, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

export function InventoryDetailClient({ id }: { id: string }) {
  const supabase = createClient()
  
  const [part, setPart] = useState<any>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch part details
    const { data: partData } = await supabase
      .from('parts')
      .select('*, brands(name), part_groups(name), part_categories(name)')
      .eq('id', id)
      .single()
      
    if (partData) {
      setPart(partData)
    }

    // Fetch movements
    const { data: moveData } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('part_id', id)
      .order('created_at', { ascending: false })

    if (moveData) {
      // Calculate running balance backwards from current stock
      let currentBal = Number(partData?.stock_quantity) || 0
      const processed = moveData.map(m => {
        const qty = Number(m.quantity)
        const record = { ...m, balance: currentBal }
        currentBal = currentBal - qty
        return record
      })
      setMovements(processed)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-slate-500">
        <div className="flex justify-center mb-4"><Package className="animate-pulse text-slate-300" size={48} /></div>
        <p className="text-xl">Loading inventory details...</p>
      </div>
    )
  }

  if (!part) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-red-500">
        <p className="text-xl">Part not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/inventory" className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{part.name}</h2>
          <p className="text-slate-500 mt-1">
            {part.part_number ? `${part.part_number} • ` : ''} 
            {part.brands?.name ? `${part.brands.name} • ` : ''} 
            {part.part_groups?.name} / {part.part_categories?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Current Stock</p>
          <div className="text-3xl font-bold text-blue-700">{part.stock_quantity} <span className="text-lg font-normal text-slate-500">{part.unit}</span></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Reorder Level</p>
          <div className="text-3xl font-bold text-slate-700">{part.reorder_level}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Unit Cost</p>
          <div className="text-3xl font-bold text-slate-700">₱{Number(part.cost || 0).toFixed(2)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Value</p>
          <div className="text-3xl font-bold text-green-700">₱{(Number(part.stock_quantity || 0) * Number(part.cost || 0)).toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            Inventory Movement History
          </h3>
          <Link href={`/stock-adjustments/new?part_id=${part.id}`} className="text-sm text-blue-600 hover:underline font-medium">
            + Adjust Stock
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium">DATE</th>
                <th className="px-6 py-3 font-medium">MOVEMENT TYPE</th>
                <th className="px-6 py-3 font-medium">REFERENCE</th>
                <th className="px-6 py-3 font-medium text-right">QTY IN</th>
                <th className="px-6 py-3 font-medium text-right">QTY OUT</th>
                <th className="px-6 py-3 font-medium text-right">BALANCE</th>
                <th className="px-6 py-3 font-medium">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                    No inventory movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map(m => {
                  const qty = Number(m.quantity)
                  const isPositive = qty > 0
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {format(new Date(m.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {m.movement_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {m.reference_type ? `${m.reference_type} ${m.reference_id ? `#${m.reference_id}` : ''}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPositive ? (
                          <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                            <TrendingUp size={14} /> +{qty}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isPositive ? (
                          <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                            <TrendingDown size={14} /> {Math.abs(qty)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {m.balance}
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
