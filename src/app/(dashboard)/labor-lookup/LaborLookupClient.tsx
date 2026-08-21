'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Edit, Plus, Wrench } from 'lucide-react'
import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'

// Types based on schema
type Make = { id: string; name: string }
type Model = { id: string; make_id: string; name: string }
type Group = { id: string; name: string }
type Category = { id: string; group_id: string; name: string }
type Service = {
  id: string
  name: string
  group_id: string | null
  category_id: string | null
  standard_hours: number | null
  rate: number | null
  labor_groups?: Group
  labor_categories?: Category
}
type LookupRate = {
  id: string
  labor_service_id: string
  vehicle_make_id: string
  vehicle_model_id: string
  year_from: number
  year_to: number
  labor_manual: number | null
  labor_automatic: number | null
  notes: string | null
  is_active: boolean
  labor_services: Service
  vehicle_makes: Make
  vehicle_models: Model
}

type Props = {
  makes: Make[]
  models: Model[]
  services: Service[]
  groups: Group[]
  categories: Category[]
  lookupRates: LookupRate[]
}

export function LaborLookupClient({ makes, models, services, lookupRates }: Props) {
  const [selectedServiceId, setSelectedServiceId] = useState('')
  
  // Optional Filters
  const [filterMakeId, setFilterMakeId] = useState('')
  const [filterModelId, setFilterModelId] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return services.find(s => s.id === selectedServiceId) || null
  }, [selectedServiceId, services])

  const availableModels = useMemo(() => {
    if (!filterMakeId) return []
    return models.filter(m => m.make_id === filterMakeId)
  }, [models, filterMakeId])

  // Get rates only for the selected service
  const serviceRates = useMemo(() => {
    if (!selectedServiceId) return []
    let result = lookupRates.filter(r => r.labor_service_id === selectedServiceId)

    if (filterMakeId) result = result.filter(r => r.vehicle_make_id === filterMakeId)
    if (filterModelId) result = result.filter(r => r.vehicle_model_id === filterModelId)
    if (filterYear) {
      const year = parseInt(filterYear)
      if (!isNaN(year)) {
        result = result.filter(r => year >= r.year_from && year <= r.year_to)
      }
    }

    // Sort by Make, then Model, then Year
    return result.sort((a, b) => {
      const makeCompare = a.vehicle_makes.name.localeCompare(b.vehicle_makes.name)
      if (makeCompare !== 0) return makeCompare
      const modelCompare = a.vehicle_models.name.localeCompare(b.vehicle_models.name)
      if (modelCompare !== 0) return modelCompare
      return b.year_from - a.year_from
    })
  }, [lookupRates, selectedServiceId, filterMakeId, filterModelId, filterYear])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Labor Rate Lookup</h1>
          <p className="text-slate-500 mt-1">Search for a service and compare labor charges across vehicles.</p>
        </div>
        <Link 
          href="/labor-lookup/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Add Vehicle Labor Rate
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="max-w-xl">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Search Labor / Service
            </label>
            <SearchableCombobox 
              options={services.map(s => ({ 
                id: s.id, 
                name: s.name, 
                subtext: s.labor_groups?.name || '' 
              })) as ComboboxOption[]}
              value={selectedServiceId}
              onChange={(val) => {
                setSelectedServiceId(val)
                // Reset filters when changing service
                setFilterMakeId('')
                setFilterModelId('')
                setFilterYear('')
              }}
              placeholder="Search labor or service..."
              searchPlaceholder="Type to search service..."
            />
          </div>
        </div>

        {selectedService && (
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Wrench size={24} className="text-blue-600" />
                  {selectedService.name}
                </h2>
                <div className="text-sm font-medium text-slate-500 mt-1 flex gap-3">
                  {selectedService.labor_groups?.name && (
                    <span>Group: {selectedService.labor_groups.name}</span>
                  )}
                  {selectedService.labor_categories?.name && (
                    <span>Category: {selectedService.labor_categories.name}</span>
                  )}
                </div>
              </div>

              {/* Optional Filters */}
              <div className="flex gap-3 bg-slate-50 p-2 rounded-md border border-slate-200">
                <select 
                  className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
                  value={filterMakeId}
                  onChange={e => {
                    setFilterMakeId(e.target.value)
                    setFilterModelId('')
                  }}
                >
                  <option value="">All Makes</option>
                  {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <select 
                  className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white disabled:bg-slate-100"
                  value={filterModelId}
                  onChange={e => setFilterModelId(e.target.value)}
                  disabled={!filterMakeId}
                >
                  <option value="">All Models</option>
                  {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input 
                  type="text"
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
                  placeholder="Year"
                  value={filterYear}
                  onChange={e => setFilterYear(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                />
              </div>
            </div>

            {serviceRates.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <p className="text-slate-600 font-medium mb-4">No vehicle-specific labor rates have been added for this service yet.</p>
                <Link 
                  href={`/labor-lookup/new?service_id=${selectedService.id}`}
                  className="inline-flex items-center gap-2 bg-white border border-blue-600 text-blue-700 px-6 py-2 rounded-md font-bold hover:bg-blue-50 transition"
                >
                  <Plus size={18} /> Add Vehicle Labor Rate
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                      <th className="px-6 py-3">Make</th>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3 text-right">Year</th>
                      <th className="px-6 py-3 text-right">Labor MT</th>
                      <th className="px-6 py-3 text-right">Labor AT</th>
                      <th className="px-6 py-3 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviceRates.map(rate => {
                      // Formatting year range if year_from != year_to
                      const yearStr = rate.year_from === rate.year_to 
                        ? rate.year_from.toString() 
                        : `${rate.year_from}–${rate.year_to === 9999 ? 'Present' : rate.year_to}`

                      return (
                        <tr key={rate.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-bold text-slate-800">{rate.vehicle_makes.name}</td>
                          <td className="px-6 py-4 font-medium text-slate-700">{rate.vehicle_models.name}</td>
                          <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm">{yearStr}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {formatCurrency(rate.labor_manual)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {formatCurrency(rate.labor_automatic)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link 
                              href={`/labor-lookup/${rate.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 transition inline-flex p-1"
                              title="Edit Rate"
                            >
                              <Edit size={18} />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!selectedService && (
          <div className="p-12 text-center text-slate-500">
            <Search className="mx-auto mb-3 opacity-20" size={48} />
            <p className="text-lg font-medium">Select a Labor / Service</p>
            <p className="text-sm mt-1">Search for a service above to view its vehicle-specific rates.</p>
          </div>
        )}
      </div>
    </div>
  )
}
