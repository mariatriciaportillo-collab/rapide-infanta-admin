import re

content = """'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Settings, X } from 'lucide-react'
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
          <h2 className="text-xl font-bold text-slate-800">Items in {transaction.reference_number}</h2>
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
              {transaction.outside_purchase_items?.map((item: any, i: number) => {
                const qty = Number(item.quantity) || 0
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
          <span className="text-slate-600 font-medium mr-4">Total Amount:</span>
          <span className="text-xl font-bold text-slate-800">
            ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function OutsidePurchasesPage() {
  const supabase = createClient()
  
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('outside_purchases')
      .select('*, suppliers(name), outside_purchase_items(quantity, unit_cost, total_amount, parts(name))')
      .order('purchase_date', { ascending: false })
      .order('created_at', { ascending: false })
      
    if (data) setPurchases(data)
    setIsLoading(false)
  }

  const filtered = purchases.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      (p.reference_number && p.reference_number.toLowerCase().includes(q)) ||
      (p.receipt_number && p.receipt_number.toLowerCase().includes(q)) ||
      (p.suppliers?.name && p.suppliers.name.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    )
  })

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Outside Purchase</h1>
          <p className="text-slate-500 mt-1">Record parts or materials purchased outside the regular purchase order process.</p>
        </div>
        <Link 
          href="/outside-purchases/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          New Outside Purchase
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search reference, receipt, or supplier..." 
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
                <th className="px-6 py-3 font-medium">REFERENCE NO.</th>
                <th className="px-6 py-3 font-medium">DATE</th>
                <th className="px-6 py-3 font-medium">SUPPLIER</th>
                <th className="px-6 py-3 font-medium text-right">ITEMS</th>
                <th className="px-6 py-3 font-medium text-right">TOTAL AMOUNT</th>
                <th className="px-6 py-3 font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="animate-pulse text-slate-300" size={32} /></div>
                    Loading outside purchases...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="text-slate-300" size={32} /></div>
                    No outside purchases found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const items = p.outside_purchase_items || []
                  const numItems = items.length
                  const totalAmount = Number(p.total_amount) || 0
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {p.reference_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {format(new Date(p.purchase_date || p.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {p.suppliers?.name || 'Unknown Supplier'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setSelectedTransaction(p); }}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                        >
                          {numItems}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/outside-purchases/${p.id}`}
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
"""

with open('src/app/(dashboard)/outside-purchases/page.tsx', 'w') as f:
    f.write(content)

