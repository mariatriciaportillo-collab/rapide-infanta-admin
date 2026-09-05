'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  Building2, User as UserIcon, Phone, Mail, MapPin, 
  FileSignature, Edit, Car, Plus, FileText, ShoppingCart
} from 'lucide-react'
import { CustomerServiceHistory } from './CustomerServiceHistory'
import { Pagination } from '@/components/ui/Pagination'

type Props = {
  customer: any
  vehicles: any[]
  estimates: any[]
  invoices: any[]
  quickSales: any[]
}

const TABS = [
  { id: 'customer', label: 'Customer' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'estimates', label: 'Estimates' },
  { id: 'service-history', label: 'Service History' },
  { id: 'sales-history', label: 'Sales History' },
]

export function CustomerTabs({ customer, vehicles, estimates, invoices, quickSales }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState('customer')
  const [vehiclesPage, setVehiclesPage] = useState(1)
  const [estimatesPage, setEstimatesPage] = useState(1)
  const [salesPage, setSalesPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    router.replace(`?tab=${tabId}`, { scroll: false })
  }

  const isCompany = customer.customer_type?.toLowerCase() === 'company'
  const displayContactPerson = isCompany 
    ? [customer.first_name, customer.last_name].filter(Boolean).join(' ') 
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* TAB BAR */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition whitespace-nowrap
                  ${isActive 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div>
        {activeTab === 'customer' && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 max-w-3xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider uppercase flex items-center gap-1
                  ${isCompany ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />}
                  {customer.customer_type}
                </span>
              </div>
              <Link 
                href={`/customers/${customer.id}/edit`}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
              >
                <Edit size={14} />
                Edit
              </Link>
            </div>

            {isCompany && displayContactPerson && (
              <div className="text-sm font-medium text-slate-500 mb-4">
                Contact: {displayContactPerson}
              </div>
            )}
            
            
            <div className="space-y-3 text-sm mt-6">
              {customer.mobile && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{customer.mobile} {customer.telephone ? `/ ${customer.telephone}` : ''}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-slate-700 leading-relaxed">{customer.address}</span>
                </div>
              )}
              {isCompany && customer.tin && (
                <div className="flex items-start gap-3">
                  <FileSignature size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-slate-700">TIN: {customer.tin}</span>
                </div>
              )}
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
            
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs text-slate-500">
                Added {customer.created_at ? format(new Date(customer.created_at), 'PPP') : '-'}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Car size={18} className="text-slate-500" />
                Vehicles ({vehicles.length})
              </h3>
              <Link 
                href={`/vehicles/new?customer_id=${customer.id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition shadow-sm"
              >
                <Plus size={16} />
                Add Vehicle
              </Link>
            </div>
            
            {vehicles.length === 0 ? (
              <div className="p-4 text-slate-500 text-sm italic">No vehicles found.</div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.slice((vehiclesPage - 1) * PAGE_SIZE, vehiclesPage * PAGE_SIZE).map(v => (
                  <div key={v.id} className="border border-slate-200 rounded-md p-4 bg-slate-50 flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800 text-lg mb-1">{v.make} {v.model} {v.year}</div>
                      <div className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider mb-2">
                        {v.plate_number}
                      </div>
                      {v.transmission && <div className="text-sm text-slate-600">Trans: {v.transmission}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/vehicles/${v.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                        <Edit size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {vehicles.length > 0 && (
              <Pagination totalCount={vehicles.length} pageSize={PAGE_SIZE} currentPage={vehiclesPage} onPageChange={setVehiclesPage} />
            )}
          </div>
        )}

        {activeTab === 'estimates' && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                Estimates ({estimates.length})
              </h3>
            </div>
            
            {estimates.length === 0 ? (
              <div className="p-4 text-slate-500 text-sm italic">No estimates found.</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Estimate No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estimates.slice((estimatesPage - 1) * PAGE_SIZE, estimatesPage * PAGE_SIZE).map(est => (
                    <tr key={est.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <Link href={`/estimates/${est.id}`} className="font-medium text-blue-600 hover:underline">
                          {est.estimate_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{est.created_at ? format(new Date(est.created_at), 'MMM d, yyyy') : '-'}</td>
                      <td className="px-4 py-3">{est.vehicles?.plate_number || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        ₱{Number(est.grand_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase
                          ${est.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                            est.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 
                            'bg-amber-50 text-amber-700 border border-amber-200'}`}
                        >
                          {est.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {estimates.length > 0 && (
              <Pagination totalCount={estimates.length} pageSize={PAGE_SIZE} currentPage={estimatesPage} onPageChange={setEstimatesPage} />
            )}
            
            
          </div>
        )}

        {activeTab === 'service-history' && (
          <CustomerServiceHistory invoices={invoices} vehicles={vehicles} />
        )}

        {activeTab === 'sales-history' && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <ShoppingCart size={18} className="text-slate-500" />
                Sales History ({quickSales.length})
              </h3>
            </div>
            
            {quickSales.length === 0 ? (
              <div className="p-4 text-slate-500 text-sm italic">No sales history found.</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Sale No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quickSales.slice((salesPage - 1) * PAGE_SIZE, salesPage * PAGE_SIZE).map(qs => (
                    <tr key={qs.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <Link href={`/quick-sale/${qs.id}`} className="font-medium text-blue-600 hover:underline">
                          {qs.sale_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{qs.created_at ? format(new Date(qs.created_at), 'MMM d, yyyy') : '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        ₱{Number(qs.grand_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase
                          ${qs.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                            'bg-amber-50 text-amber-700 border border-amber-200'}`}
                        >
                          {qs.status || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {quickSales.length > 0 && (
              <Pagination totalCount={quickSales.length} pageSize={PAGE_SIZE} currentPage={salesPage} onPageChange={setSalesPage} />
            )}
            
            
          </div>
        )}
      </div>
    </div>
  )
}
