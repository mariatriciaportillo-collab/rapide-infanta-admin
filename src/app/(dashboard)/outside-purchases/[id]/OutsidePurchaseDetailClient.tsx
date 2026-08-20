'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, User, Calendar, FileText, CheckCircle, Building2, Package } from 'lucide-react'
import { format } from 'date-fns'

export function OutsidePurchaseDetailClient({ id }: { id: string }) {
  const supabase = createClient()
  
  const [purchase, setPurchase] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch outside purchase
    const { data: opData } = await supabase
      .from('outside_purchases')
      .select('*, suppliers(name), profiles:created_by(email)')
      .eq('id', id)
      .single()
      
    if (opData) {
      setPurchase(opData)
      
      // Fetch items
      const { data: itemData } = await supabase
        .from('outside_purchase_items')
        .select('*, parts(name, part_number, unit)')
        .eq('outside_purchase_id', id)
        .order('id')
        
      if (itemData) setItems(itemData)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading outside purchase...</div>
  }

  if (!purchase) {
    return <div className="p-8 text-center text-slate-500">Outside Purchase not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/outside-purchases" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">{purchase.reference_number}</h2>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-green-200">
          <CheckCircle size={16} /> Completed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Building2 size={14} /> Supplier</div>
              <div className="font-bold text-lg text-slate-800">{purchase.suppliers?.name || 'Unknown Supplier'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar size={14} /> Purchase Date</div>
              <div className="font-medium text-slate-800">{format(new Date(purchase.purchase_date), 'MMMM d, yyyy')}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FileText size={14} /> Receipt / Ref No.</div>
              <div className="font-medium text-slate-800">{purchase.receipt_number || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><User size={14} /> Created By</div>
              <div className="font-medium text-slate-800">{purchase.profiles?.email || 'Unknown User'}</div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</div>
            <div className="text-slate-600">{purchase.notes || 'None'}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-sm flex flex-col justify-center">
          <div className="text-slate-400 font-medium mb-1">Total Amount</div>
          <div className="text-3xl font-bold text-white mb-4">
            ₱{Number(purchase.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-700 pt-4">
            <span className="text-slate-400">Total Items</span>
            <span className="font-bold text-white flex items-center gap-1"><Package size={14} /> {items.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Purchase Items</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
            <tr>
              <th className="px-6 py-3">Part / Material</th>
              <th className="px-6 py-3">Treatment</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-right">Unit Cost</th>
              <th className="px-6 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => {
              const qty = Number(item.quantity)
              const cost = Number(item.unit_cost)
              const total = Number(item.total_amount)
              const unit = item.parts?.unit || 'pcs'

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{item.parts?.name || 'Unknown Part'}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{item.parts?.part_number || 'No SKU'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      item.inventory_treatment === 'ADD_TO_INVENTORY' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.inventory_treatment === 'ADD_TO_INVENTORY' ? 'Add to Inventory' : 'Direct Use / Non-Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {qty} <span className="text-sm font-normal text-slate-400">{unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    ₱{cost.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    ₱{total.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                </tr>
              )
            })}
            
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No items found in this purchase.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
