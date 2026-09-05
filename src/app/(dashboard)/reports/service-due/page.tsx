'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Clock, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { format, isPast, isToday, addDays, isBefore } from 'date-fns'

export default function ServiceDueReportPage() {
  const supabase = createClient()
  const [history, setHistory] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All') // All, Due Today, Next 7 Days, Next 30 Days, Overdue
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServiceDue()
  }, [])

  const fetchServiceDue = async () => {
    setLoading(true)
    // Fetch all history that has a next_due_date or next_due_mileage
    // Ideally we should select distinct per vehicle (latest service only)
    // We can do this in memory since it's a lightweight app for now.
    const { data } = await supabase
      .from('service_history')
      .select('*, vehicles(plate_number, make, model), customers(name, mobile)')
      .or('next_due_date.not.is.null,next_due_mileage.not.is.null')
      .order('service_date', { ascending: false })
      
    if (data) {
      // deduplicate per vehicle (keep latest)
      const latestPerVehicle = new Map()
      data.forEach(h => {
        if (!latestPerVehicle.has(h.vehicle_id)) {
          latestPerVehicle.set(h.vehicle_id, h)
        }
      })
      setHistory(Array.from(latestPerVehicle.values()))
    }
    setLoading(false)
  }

  const getStatus = (item: any) => {
    if (!item.next_due_date) return { label: 'Upcoming', color: 'bg-slate-100 text-slate-700' }
    const due = new Date(item.next_due_date)
    if (isPast(due) && !isToday(due)) return { label: 'Overdue', color: 'bg-red-100 text-red-700' }
    if (isToday(due)) return { label: 'Due Today', color: 'bg-orange-100 text-orange-700' }
    if (isBefore(due, addDays(new Date(), 7))) return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Upcoming', color: 'bg-green-100 text-green-700' }
  }

  const filtered = history.filter(h => {
    // text search
    const term = search.toLowerCase()
    const plate = h.vehicles?.plate_number?.toLowerCase() || ''
    const cname = h.customers?.name?.toLowerCase() || ''
    const sname = h.service_name?.toLowerCase() || ''
    const matchesSearch = plate.includes(term) || cname.includes(term) || sname.includes(term)
    
    if (!matchesSearch) return false

    // date filter
    const status = getStatus(h).label
    if (filter === 'Overdue') return status === 'Overdue'
    if (filter === 'Due Today') return status === 'Due Today'
    if (filter === 'Next 7 Days') return status === 'Due Soon' || status === 'Due Today'
    if (filter === 'Next 30 Days') {
       if (!h.next_due_date) return false
       const due = new Date(h.next_due_date)
       return isBefore(due, addDays(new Date(), 30)) && !isPast(due)
    }
    return true
  }).sort((a, b) => {
    if (!a.next_due_date) return 1
    if (!b.next_due_date) return -1
    return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Service Due Report</h1>
          <p className="text-sm text-slate-500">Monitor upcoming and overdue vehicle services</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search plate, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['All', 'Due Today', 'Next 7 Days', 'Next 30 Days', 'Overdue'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Customer / Vehicle</th>
                <th className="p-4 font-semibold">Last Service</th>
                <th className="p-4 font-semibold">Last Date & Mileage</th>
                <th className="p-4 font-semibold">Next Due Date</th>
                <th className="p-4 font-semibold">Next Due Mileage</th>
                <th className="p-4  text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading service schedule...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No vehicles due for service matching criteria.</td></tr>
              ) : (
                filtered.map(h => {
                  const statusInfo = getStatus(h)
                  return (
                    <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{h.customers?.name || '-'}</div>
                        <div className="text-sm text-slate-500">{h.customers?.mobile || 'No mobile'}</div>
                        <div className="text-sm font-medium text-blue-600 mt-1">{h.vehicles?.plate_number}</div>
                        <div className="text-xs text-slate-500">{h.vehicles?.make} {h.vehicles?.model}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{h.service_name || '-'}</div>
                        {h.oil_type && <div className="text-sm text-slate-500">{h.oil_type}</div>}
                      </td>
                      <td className="p-4 text-sm text-slate-600 text-right">
                        {format(new Date(h.service_date), 'MMM d, yyyy')}
                        <br/>
                        <span className="text-xs text-slate-400">{h.mileage ? h.mileage.toLocaleString() + ' km' : ''}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {h.next_due_date ? format(new Date(h.next_due_date), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="p-4 font-medium text-slate-800 text-right">
                        {h.next_due_mileage ? h.next_due_mileage.toLocaleString() + ' km' : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
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
