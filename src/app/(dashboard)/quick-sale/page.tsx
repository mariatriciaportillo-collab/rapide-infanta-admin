'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Printer, Banknote, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { TableActions, TableAction } from '@/components/ui/TableActions'
import { useRouter } from 'next/navigation'

export default function QuickSaleList() {
  const supabase = createClient()
  const router = useRouter()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('quick_sales')
        .select(`
          *,
          customers:customer_id(name, first_name, last_name, customer_type)
        `)
        .order('created_at', { ascending: false })
      
      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        query = query.or(`quick_sale_number.ilike.%${q}%, customers.name.ilike.%${q}%, customers.first_name.ilike.%${q}%, customers.last_name.ilike.%${q}%`)
      }

      const { data } = await query
      if (data) setSales(data)
      setLoading(false)
    }
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [supabase, searchQuery, statusFilter])

  const formatCustomerName = (c: any) => {
    if (!c) return 'Unknown'
    if (c.customer_type === 'company') return c.name
    return c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quick Sales</h1>
          <p className="text-slate-500">Over-the-counter parts and materials</p>
        </div>
        <Link href="/quick-sale/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 shadow-sm transition">
          <Plus size={18} />
          New Quick Sale
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Quick Sale No. or Customer..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="text-slate-500" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-md py-2 pl-3 pr-8 bg-white text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="UNPAID">Pending Payment</option>
              <option value="PARTIALLY PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold w-32">QS No.</th>
                <th className="px-4 py-3 font-semibold w-32">Date</th>
                <th className="px-4 py-3 font-semibold w-full">Customer</th>
                <th className="px-4 py-3 font-semibold text-right w-32">Total</th>
                <th className="px-4 py-3 font-semibold w-32 text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No quick sales found</td></tr>
              ) : (
                sales.map(s => {
                  let badgeClass = 'bg-slate-100 text-slate-600'
                  let displayStatus = s.status
                  if (s.status === 'PAID') badgeClass = 'bg-emerald-100 text-emerald-700'
                  else if (s.status === 'UNPAID') { badgeClass = 'bg-amber-100 text-amber-700'; displayStatus = 'PENDING PAYMENT'; }
                  else if (s.status === 'PARTIALLY PAID') badgeClass = 'bg-amber-100 text-amber-700'
                  
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                        <Link href={`/quick-sale/${s.id}`}>{s.quick_sale_number}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{format(new Date(s.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-slate-800 max-w-[200px] truncate" title={formatCustomerName(s.customers)}>
                        {formatCustomerName(s.customers)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        ₱{Number(s.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${badgeClass}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          {s.status === 'DRAFT' ? (
                            <TableAction icon={Edit} label="Edit Quick Sale" href={`/quick-sale/${s.id}`} />
                          ) : s.status === 'PAID' ? (
                            <TableAction icon={Printer} label="Print Payment Receipt" href={`/quick-sale/${s.id}/receipt`} />
                          ) : (
                            <TableAction icon={Banknote} label="Collect Payment" href={`/quick-sale/${s.id}`} variant="success" />
                          )}
                        </TableActions>
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
