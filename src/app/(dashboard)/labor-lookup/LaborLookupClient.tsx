'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Edit, Plus, Wrench, Car, ArrowRight } from 'lucide-react'
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
  lookupRates: LookupRate[]
}

export function LaborLookupClient({ makes, models, services, lookupRates }: Props) {
  const [mode, setMode] = useState<'labor' | 'vehicle'>('labor')

  // === MODE 1: SEARCH BY LABOR ===
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [filterMakeId, setFilterMakeId] = useState('')
  const [filterModelId, setFilterModelId] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return services.find(s => s.id === selectedServiceId) || null
  }, [selectedServiceId, services])

  const availableModelsForLabor = useMemo(() => {
    if (!filterMakeId) return []
    return models.filter(m => m.make_id === filterMakeId)
  }, [models, filterMakeId])

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

    return result.sort((a, b) => {
      const makeCompare = a.vehicle_makes.name.localeCompare(b.vehicle_makes.name)
      if (makeCompare !== 0) return makeCompare
      const modelCompare = a.vehicle_models.name.localeCompare(b.vehicle_models.name)
      if (modelCompare !== 0) return modelCompare
      return b.year_from - a.year_from
    })
  }, [lookupRates, selectedServiceId, filterMakeId, filterModelId, filterYear])


  // === MODE 2: SEARCH BY VEHICLE ===
  const [vehMakeId, setVehMakeId] = useState('')
  const [vehModelId, setVehModelId] = useState('')
  const [vehYear, setVehYear] = useState('')

  const availableModelsForVeh = useMemo(() => {
    if (!vehMakeId) return []
    return models.filter(m => m.make_id === vehMakeId)
  }, [models, vehMakeId])

  const selectedVehicleName = useMemo(() => {
    const make = makes.find(m => m.id === vehMakeId)?.name
    const model = models.find(m => m.id === vehModelId)?.name
    if (make && model && vehYear) return `${make} ${model} ${vehYear}`
    return null
  }, [makes, models, vehMakeId, vehModelId, vehYear])

  const vehicleRates = useMemo(() => {
    if (!vehMakeId || !vehModelId || !vehYear) return []
    const year = parseInt(vehYear)
    if (isNaN(year)) return []
    
    let result = lookupRates.filter(r => 
      r.vehicle_make_id === vehMakeId && 
      r.vehicle_model_id === vehModelId &&
      year >= r.year_from && year <= r.year_to
    )

    return result.sort((a, b) => a.labor_services.name.localeCompare(b.labor_services.name))
  }, [lookupRates, vehMakeId, vehModelId, vehYear])


  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Labor Rate Lookup</h1>
          <p className="text-slate-500 mt-1">Search for a service or vehicle to view saved labor reference rates.</p>
        </div>
        <Link 
          href="/labor-lookup/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Add Vehicle Labor Rate
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            className={`flex-1 py-4 text-center font-bold text-sm tracking-wide transition uppercase ${
              mode === 'labor' 
                ? 'bg-white text-blue-700 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-b-2 border-transparent'
            }`}
            onClick={() => setMode('labor')}
          >
            Search by Labor
          </button>
          <button
            type="button"
            className={`flex-1 py-4 text-center font-bold text-sm tracking-wide transition uppercase ${
              mode === 'vehicle' 
                ? 'bg-white text-blue-700 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-b-2 border-transparent'
            }`}
            onClick={() => setMode('vehicle')}
          >
            Search by Vehicle
          </button>
        </div>

        {/* MODE 1: LABOR */}
        {mode === 'labor' && (
          <div>
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="max-w-2xl">
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

            {selectedService ? (
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
                      className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white font-medium text-slate-700"
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
                      className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white font-medium text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                      value={filterModelId}
                      onChange={e => setFilterModelId(e.target.value)}
                      disabled={!filterMakeId}
                    >
                      <option value="">All Models</option>
                      {availableModelsForLabor.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input 
                      type="text"
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white font-medium text-slate-700"
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
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
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
                          const yearStr = rate.year_from === rate.year_to 
                            ? rate.year_from.toString() 
                            : `${rate.year_from}–${rate.year_to === 9999 ? 'Present' : rate.year_to}`

                          return (
                            <tr key={rate.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4 font-bold text-slate-800">{rate.vehicle_makes.name}</td>
                              <td className="px-6 py-4 font-medium text-slate-700">{rate.vehicle_models.name}</td>
                              <td className="px-6 py-4 text-right text-slate-600 font-mono text-sm bg-slate-50">{yearStr}</td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900">
                                {formatCurrency(rate.labor_manual)}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900">
                                {formatCurrency(rate.labor_automatic)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Link 
                                  href={`/labor-lookup/${rate.id}/edit`}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                                >
                                  Edit
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
            ) : (
              <div className="p-16 text-center text-slate-500">
                <Search className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-xl font-bold text-slate-700">Search for a Labor / Service</p>
                <p className="text-sm mt-2 text-slate-500">Select a service above to compare its rates across vehicles.</p>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: VEHICLE */}
        {mode === 'vehicle' && (
          <div>
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-wrap gap-4 items-end max-w-4xl">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Make
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-300 rounded-md outline-none focus:border-blue-500 bg-white font-medium text-slate-800 shadow-sm"
                    value={vehMakeId}
                    onChange={e => {
                      setVehMakeId(e.target.value)
                      setVehModelId('')
                    }}
                  >
                    <option value="">Select Make...</option>
                    {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Model
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-300 rounded-md outline-none focus:border-blue-500 bg-white font-medium text-slate-800 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                    value={vehModelId}
                    onChange={e => setVehModelId(e.target.value)}
                    disabled={!vehMakeId}
                  >
                    <option value="">Select Model...</option>
                    {availableModelsForVeh.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Year
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-md outline-none focus:border-blue-500 bg-white font-mono font-medium text-slate-800 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="YYYY"
                    value={vehYear}
                    onChange={e => setVehYear(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={4}
                    disabled={!vehModelId}
                  />
                </div>
              </div>
            </div>

            {selectedVehicleName ? (
              <div className="p-6">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Car size={24} className="text-blue-600" />
                    {selectedVehicleName}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Labor references saved for this exact vehicle</p>
                </div>

                {vehicleRates.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <p className="text-slate-600 font-medium mb-4">No labor reference rates have been added for this vehicle yet.</p>
                    <Link 
                      href={`/labor-lookup/new?make_id=${vehMakeId}&model_id=${vehModelId}&year=${vehYear}`}
                      className="inline-flex items-center gap-2 bg-white border border-blue-600 text-blue-700 px-6 py-2 rounded-md font-bold hover:bg-blue-50 transition"
                    >
                      <Plus size={18} /> Add Vehicle Labor Rate
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                          <th className="px-6 py-3 w-80">Labor / Service</th>
                          <th className="px-6 py-3">Group</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3 text-right w-32">Labor MT</th>
                          <th className="px-6 py-3 text-right w-32">Labor AT</th>
                          <th className="px-6 py-3 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vehicleRates.map(rate => (
                          <tr key={rate.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-bold text-slate-800">{rate.labor_services.name}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600 bg-slate-50">
                              {rate.labor_services.labor_groups?.name || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                              {rate.labor_services.labor_categories?.name || '—'}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900">
                              {formatCurrency(rate.labor_manual)}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900">
                              {formatCurrency(rate.labor_automatic)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Link 
                                href={`/labor-lookup/${rate.id}/edit`}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500">
                <Car className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-xl font-bold text-slate-700">Select a Vehicle</p>
                <p className="text-sm mt-2 text-slate-500">Provide the Make, Model, and Year above to view labor rates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
