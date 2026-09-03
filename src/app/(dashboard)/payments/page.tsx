'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'

export default function PaymentsList() {
  const supabase = createClient()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          customers:customer_id(first_name, last_name, company_name, customer_type),
          invoices:invoice_id(invoice_number),
          quick_sales:quick_sale_id(quick_sale_number)
        `)
        .order('created_at', { ascending: false })
      if (data) setPayments(data)
      setLoading(false)
    }
    load()
  }, [supabase])

  const formatCustomerName = (c: any) => {
    if (!c) return 'Unknown'
    if (c.customer_type === 'company') return c.company_name
    return `${c.first_name} ${c.last_name}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500">History of all recorded payments and official receipts</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Receipt No.</th>
                <th className="px-4 py-3 font-semibold">Date / Time</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Ref. Document</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No payments found</td></tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                      <Link href={`/payments/${p.id}/print`} target="_blank">{p.receipt_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{format(new Date(p.created_at), 'MMM d, yyyy h:mm a')}</td>
                    <td className="px-4 py-3 text-slate-800">{formatCustomerName(p.customers)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.invoices ? (
                        <Link href={`/invoice/${p.invoice_id}`} className="hover:underline">{p.invoices.invoice_number}</Link>
                      ) : p.quick_sales ? (
                        <Link href={`/quick-sale/${p.quick_sale_id}`} className="hover:underline">{p.quick_sales.quick_sale_number}</Link>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.payment_method}
                      {p.reference_number && p.reference_number !== 'N/A' && <span className="block text-xs text-slate-400">Ref: {p.reference_number}</span>}
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
      </div>
    </div>
  )
}
