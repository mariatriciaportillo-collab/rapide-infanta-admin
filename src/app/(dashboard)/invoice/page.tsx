'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Plus, Search, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function InvoiceList() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          customers:customer_id(first_name, last_name, company_name, customer_type),
          vehicles:vehicle_id(plate_number, make, model)
        `)
        .order('created_at', { ascending: false })
      if (data) setInvoices(data)
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
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-slate-500">Billing statements for completed jobs</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Inv No.</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold text-right">Balance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No invoices found</td></tr>
              ) : (
                invoices.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                      <Link href={`/invoice/${s.id}`}>{s.invoice_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{format(new Date(s.created_at), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-slate-800">{formatCustomerName(s.customers)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.vehicles ? `${s.vehicles.make} ${s.vehicles.model} - ${s.vehicles.plate_number}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      ₱{Number(s.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600">
                      ₱{Number(s.balance_due).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        s.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                        s.status === 'PARTIALLY PAID' ? 'bg-amber-100 text-amber-700' : s.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.status}
                      </span>
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
