'use client'

import React, { useState } from 'react'
import { FileText, Car, Filter, Calendar, History } from 'lucide-react'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'
import { format } from 'date-fns'

type Props = {
  invoices: any[]
  vehicles: any[]
}

export function CustomerServiceHistory({ invoices, vehicles }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const filteredInvoices = invoices.filter(inv => {
    if (selectedVehicle === 'all') return true
    return inv.vehicle_id === selectedVehicle
  })

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <History className="text-slate-500" size={18} />
          Service History ({filteredInvoices.length})
        </h3>
        
        {vehicles && vehicles.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select 
              value={selectedVehicle}
              onChange={e => { setSelectedVehicle(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-md py-1.5 pl-3 pr-8 bg-white text-sm"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} - {v.plate_number}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {filteredInvoices.length === 0 ? (
        <div className="p-4 text-slate-500 text-sm italic">
          No service history found for {selectedVehicle === 'all' ? 'this customer' : 'this vehicle'}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service Description</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(inv => {
                // Generate description
                const items = inv.invoice_items || []
                // Only take top 3 items to avoid massive text, join by comma
                const serviceDesc = items.length > 0 
                  ? items.slice(0, 3).map((i: any) => i.description).filter(Boolean).join(', ') + (items.length > 3 ? '...' : '')
                  : 'General Service'
                
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {inv.created_at ? format(new Date(inv.created_at), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{inv.vehicles?.plate_number || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{inv.vehicles?.make} {inv.vehicles?.model}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={serviceDesc}>
                      {serviceDesc || 'General Service'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/invoice/${inv.id}`} className="text-blue-600 hover:underline font-medium">
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 whitespace-nowrap">
                      ₱{Number(inv.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase
                        ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                          inv.status === 'PARTIALLY PAID' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                          'bg-amber-50 text-amber-700 border border-amber-200'}`}
                      >
                        {inv.status || 'UNPAID'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {filteredInvoices.length > 0 && (
        <Pagination totalCount={filteredInvoices.length} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
      )}
    </div>
  )
}
