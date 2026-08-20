'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Settings } from 'lucide-react'
import { format } from 'date-fns'

export default function OutsidePurchasesPage() {
  const supabase = createClient()
  
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('outside_purchases')
      .select('*, suppliers(name)')
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
      (p.suppliers?.name && p.suppliers.name.toLowerCase().includes(q))
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
                <th className="px-6 py-3 font-medium">RECEIPT NO.</th>
                <th className="px-6 py-3 font-medium text-right">TOTAL AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="animate-pulse text-slate-300" size={32} /></div>
                    Loading outside purchases...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Settings className="text-slate-300" size={32} /></div>
                    No outside purchases found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = `/outside-purchases/${p.id}`}>
                    <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                      <Link href={`/outside-purchases/${p.id}`}>{p.reference_number}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {format(new Date(p.purchase_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {p.suppliers?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.receipt_number || '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ₱{Number(p.total_amount).toFixed(2)}
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
