'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'

export default function PaymentsModule() {
  const supabase = createClient()
  const [tab, setTab] = useState<'collectibles' | 'history'>('collectibles')
  
  const [collectibles, setCollectibles] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    
    // 1. Fetch Invoices ready for payment
    const { data: invData } = await supabase
      .from('invoices')
      .select(`id, invoice_number, created_at, grand_total, amount_paid, balance_due, status, customers:customer_id(first_name, last_name, company_name, customer_type)`)
      .in('status', ['UNPAID', 'PARTIALLY PAID'])
      
    // 2. Fetch Quick Sales ready for payment (Assuming status is UNPAID or PARTIALLY PAID)
    const { data: qsData } = await supabase
      .from('quick_sales')
      .select(`id, quick_sale_number, created_at, grand_total, amount_paid, balance_due, status, customers:customer_id(first_name, last_name, company_name, customer_type)`)
      .in('status', ['UNPAID', 'PARTIALLY PAID'])

    const merged = [
      ...(invData || []).map(i => ({ ...i, source: 'Invoice', ref: i.invoice_number, link: `/invoice/${i.id}` })),
      ...(qsData || []).map(q => ({ ...q, source: 'Quick Sale', ref: q.quick_sale_number, link: `/quick-sale/${q.id}` }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    setCollectibles(merged)

    // 3. Fetch Payment History
    const { data: payData } = await supabase
      .from('payments')
      .select(`
        *,
        customers:customer_id(first_name, last_name, company_name, customer_type),
        invoices:invoice_id(invoice_number),
        quick_sales:quick_sale_id(quick_sale_number)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
      
    setHistory(payData || [])
    
    setLoading(false)
  }

  const formatCustomerName = (c: any) => {
    if (!c) return 'Unknown'
    if (c.customer_type === 'company') return c.company_name
    return `${c.first_name} ${c.last_name}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-slate-500">Manage collectibles and official receipts</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setTab('collectibles')}
          className={`pb-2 px-2 font-medium text-sm transition ${tab === 'collectibles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Collectibles
        </button>
        <button 
          onClick={() => setTab('history')}
          className={`pb-2 px-2 font-medium text-sm transition ${tab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Payment History
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {tab === 'collectibles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Paid</th>
                  <th className="px-4 py-3 font-semibold text-right">Balance</th>
                  <th className="px-4 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : collectibles.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No collectibles found. Push Invoices or Quick Sales to Payments first.</td></tr>
                ) : (
                  collectibles.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${c.source === 'Invoice' ? 'bg-indigo-100 text-indigo-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                          {c.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.ref}</td>
                      <td className="px-4 py-3 text-slate-800">{formatCustomerName(c.customers)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">₱{Number(c.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">₱{Number(c.amount_paid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600">₱{Number(c.balance_due).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={c.link} className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs">
                          Record Payment
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt No.</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Ref. Document</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments found</td></tr>
                ) : (
                  history.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                        <Link href={`/payments/${p.id}/print`} target="_blank">{p.receipt_number}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-slate-800">{formatCustomerName(p.customers)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.invoices ? (
                          <Link href={`/invoice/${p.invoice_id}`} className="hover:underline">{p.invoices.invoice_number}</Link>
                        ) : p.quick_sales ? (
                          <Link href={`/quick-sale/${p.quick_sale_id}`} className="hover:underline">{p.quick_sales.quick_sale_number}</Link>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {p.payment_method}
                        {p.reference_number && p.reference_number !== 'N/A' && <span className="block text-slate-400">Ref: {p.reference_number}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₱{Number(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
