'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Search, History, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function ServiceHistoryPage() {
  const supabase = createClient()
  const [history, setHistory] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('service_history')
      .select('*, vehicles(plate_number, make, model), customers(name), invoices(invoice_number)')
      .order('service_date', { ascending: false })
      .limit(200)
    
    if (data) setHistory(data)
    setLoading(false)
  }

  const filtered = history.filter(h => {
    const term = search.toLowerCase()
    const plate = h.vehicles?.plate_number?.toLowerCase() || ''
    const cname = h.customers?.name?.toLowerCase() || ''
    const sname = h.service_name?.toLowerCase() || ''
    return plate.includes(term) || cname.includes(term) || sname.includes(term)
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Service History</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by plate, customer, or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer / Vehicle</th>
                <th className="p-4 font-medium">Service / Oil Type</th>
                <th className="p-4 font-medium">Mileage</th>
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Next Due</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">Loading history...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No service history found.</td></tr>
              ) : (
                filtered.map(h => (
                  <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {format(new Date(h.service_date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{h.customers?.name || '-'}</div>
                      <div className="text-sm text-slate-500">{h.vehicles?.plate_number} • {h.vehicles?.make} {h.vehicles?.model}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{h.service_name || '-'}</div>
                      {h.oil_type && <div className="text-sm text-slate-500">{h.oil_type}</div>}
                    </td>
                    <td className="p-4 text-sm text-slate-600 text-right">
                      {h.mileage ? h.mileage.toLocaleString() + ' km' : '-'}
                    </td>
                    <td className="p-4 text-sm">
                      {h.invoice_id ? (
                        <Link href={`/invoice/${h.invoice_id}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <FileText size={14} /> {h.invoices?.invoice_number || 'View'}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 text-right">
                      {h.next_due_date ? format(new Date(h.next_due_date), 'MMM d, yyyy') : '-'}
                      <br/>
                      {h.next_due_mileage ? h.next_due_mileage.toLocaleString() + ' km' : ''}
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
