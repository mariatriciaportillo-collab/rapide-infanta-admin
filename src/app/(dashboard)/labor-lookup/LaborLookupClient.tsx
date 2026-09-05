'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Search, Edit, Plus, Wrench, Car, Loader2 } from 'lucide-react'
import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'
import { Pagination } from '@/components/ui/Pagination'

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
}

const PAGE_SIZE = 10

export function LaborLookupClient({ makes, models, services }: Props) {
  const supabase = createClient()
  const [mode, setMode] = useState<'labor' | 'vehicle'>('labor')

  // === PAGINATION STATE ===
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedRates, setPaginatedRates] = useState<LookupRate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // === MODE 1: SEARCH BY LABOR ===
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [filterMakeId, setFilterMakeId] = useState('')
  const [filterModelId, setFilterModelId] = useState('')

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return services.find(s => s.id === selectedServiceId) || null
  }, [selectedServiceId, services])

  const availableModelsForLabor = useMemo(() => {
    if (!filterMakeId) return []
    return models.filter(m => m.make_id === filterMakeId)
  }, [models, filterMakeId])

  // === MODE 2: SEARCH BY VEHICLE ===
  const [vehMakeId, setVehMakeId] = useState('')
  const [vehModelId, setVehModelId] = useState('')

  const availableModelsForVeh = useMemo(() => {
    if (!vehMakeId) return []
    return models.filter(m => m.make_id === vehMakeId)
  }, [models, vehMakeId])

  const selectedVehicleName = useMemo(() => {
    const make = makes.find(m => m.id === vehMakeId)?.name
    const model = models.find(m => m.id === vehModelId)?.name
    if (make && model) return `${make} ${model}`
    return null
  }, [makes, models, vehMakeId, vehModelId])

  // === DATA FETCHING ===
  const fetchRates = useCallback(async () => {
    const isLaborModeValid = mode === 'labor' && selectedServiceId
    const isVehicleModeValid = mode === 'vehicle' && vehMakeId && vehModelId

    if (!isLaborModeValid && !isVehicleModeValid) {
      setPaginatedRates([])
      setTotalCount(0)
      return
    }

    setIsLoading(true)

    // Base query
    let query = supabase
      .from('labor_lookup_rates')
      .select(`
        *,
        labor_services (
          *,
          labor_groups (*),
          labor_categories (*)
        ),
        vehicle_makes (*),
        vehicle_models (*)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply Mode Filters
    if (mode === 'labor') {
      query = query.eq('labor_service_id', selectedServiceId)
      if (filterMakeId) query = query.eq('vehicle_make_id', filterMakeId)
      if (filterModelId) query = query.eq('vehicle_model_id', filterModelId)
    } else {
      query = query
        .eq('vehicle_make_id', vehMakeId)
        .eq('vehicle_model_id', vehModelId)
    }

    // Apply Sorting
    if (mode === 'labor') {
      query = query.order('vehicle_make_id', { ascending: true }).order('vehicle_model_id', { ascending: true })
    } else {
      query = query.order('labor_service_id', { ascending: true })
    }

    // Apply Pagination Range
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (!error && data) {
      setPaginatedRates(data as LookupRate[])
      setTotalCount(count || 0)
    } else {
      console.error("Failed to fetch rates:", error)
      setPaginatedRates([])
      setTotalCount(0)
    }

    setIsLoading(false)
  }, [supabase, mode, selectedServiceId, filterMakeId, filterModelId, vehMakeId, vehModelId, page])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  // Reset to page 1 when filters or modes change
  useEffect(() => {
    setPage(1)
  }, [mode, selectedServiceId, filterMakeId, filterModelId, vehMakeId, vehModelId])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-medium text-slate-900 tracking-tight">Labor Rate Lookup</h1>
          <p className="text-slate-500 mt-1">Search for a service or vehicle to view saved labor reference rates.</p>
        </div>
        <Link 
          href="/labor-lookup/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Add Vehicle Labor Rate
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-50 border-b border-slate-200 rounded-t-lg">
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
                    setFilterMakeId('')
                    setFilterModelId('')
                  }}
                  placeholder="Search labor or service..."
                  searchPlaceholder="Type to search service..."
                />
              </div>
            </div>

            {selectedService ? (
              <div>
                <div className="p-6 pb-0">
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

                    <div className="flex gap-3 bg-slate-50 p-2 rounded-md border border-slate-200">
                      <select 
                        className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white font-medium text-slate-700 w-36"
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
                        className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white font-medium text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 w-40"
                        value={filterModelId}
                        onChange={e => setFilterModelId(e.target.value)}
                        disabled={!filterMakeId}
                      >
                        <option value="">All Models</option>
                        {availableModelsForLabor.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                      <div className="flex flex-col items-center text-slate-500 gap-2">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="font-medium">Loading rates...</span>
                      </div>
                    </div>
                  ) : paginatedRates.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-lg ">
                      <p className="text-slate-600 font-medium mb-4">No vehicle-specific labor rates found for this criteria.</p>
                      <Link 
                        href={`/labor-lookup/new?service_id=${selectedService.id}`}
                        className="inline-flex items-center gap-2 bg-white border border-blue-600 text-blue-700 px-6 py-2 rounded-md font-bold hover:bg-blue-50 transition"
                      >
                        <Plus size={18} /> Add Vehicle Labor Rate
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Make</th>
                              <th className="px-4 py-3 font-semibold">Model</th>
                              <th className="px-4 py-3 text-right font-semibold">Labor MT</th>
                              <th className="px-4 py-3 text-right font-semibold">Labor AT</th>
                              <th className="px-4 py-3 w-24 font-semibold text-right w-16">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedRates.map(rate => (
                              <tr key={rate.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{rate.vehicle_makes?.name || 'Unknown'}</td>
                                <td className="px-4 py-3 font-medium text-slate-700">{rate.vehicle_models?.name || 'Unknown'}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                  {formatCurrency(rate.labor_manual)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                  {formatCurrency(rate.labor_automatic)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <TableActions align="right"><TableAction icon={Edit} label="Edit" href={`/labor-lookup/${rate.id}/edit`} /></TableActions>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <Pagination
                        totalCount={totalCount}
                        pageSize={PAGE_SIZE}
                        currentPage={page}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
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
              <div className="flex flex-col md:flex-row gap-4 items-end max-w-4xl">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Make
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-300 rounded-md outline-none focus:border-blue-500 bg-white font-medium text-slate-900 shadow-sm"
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
                
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Model
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-300 rounded-md outline-none focus:border-blue-500 bg-white font-medium text-slate-900 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                    value={vehModelId}
                    onChange={e => setVehModelId(e.target.value)}
                    disabled={!vehMakeId}
                  >
                    <option value="">Select Model...</option>
                    {availableModelsForVeh.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {selectedVehicleName ? (
              <div>
                <div className="p-6 pb-0">
                  <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <Car size={24} className="text-blue-600" />
                      {selectedVehicleName}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Labor references saved for this vehicle</p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                      <div className="flex flex-col items-center text-slate-500 gap-2">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="font-medium">Loading rates...</span>
                      </div>
                    </div>
                  ) : paginatedRates.length === 0 ? (
                    <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-lg ">
                      <p className="text-slate-600 font-medium mb-4">No labor reference rates have been added for this vehicle yet.</p>
                      <Link 
                        href={`/labor-lookup/new?make_id=${vehMakeId}&model_id=${vehModelId}`}
                        className="inline-flex items-center gap-2 bg-white border border-blue-600 text-blue-700 px-6 py-2 rounded-md font-bold hover:bg-blue-50 transition"
                      >
                        <Plus size={18} /> Add Vehicle Labor Rate
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 w-80 font-semibold">Labor / Service</th>
                              <th className="px-4 py-3 font-semibold">Group</th>
                              <th className="px-4 py-3 font-semibold">Category</th>
                              <th className="px-4 py-3 text-right w-32 font-semibold">Labor MT</th>
                              <th className="px-4 py-3 text-right w-32 font-semibold">Labor AT</th>
                              <th className="px-4 py-3 w-24 font-semibold text-right w-16">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedRates.map(rate => (
                              <tr key={rate.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{rate.labor_services?.name || 'Unknown'}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                  {rate.labor_services?.labor_groups?.name || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-600">
                                  {rate.labor_services?.labor_categories?.name || '—'}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                  {formatCurrency(rate.labor_manual)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                  {formatCurrency(rate.labor_automatic)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <TableActions align="right"><TableAction icon={Edit} label="Edit" href={`/labor-lookup/${rate.id}/edit`} /></TableActions>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <Pagination
                        totalCount={totalCount}
                        pageSize={PAGE_SIZE}
                        currentPage={page}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500">
                <Car className="mx-auto mb-4 opacity-20" size={48} />
                <p className="text-xl font-bold text-slate-700">Select a Vehicle</p>
                <p className="text-sm mt-2 text-slate-500">Select the Make and Model above to view labor rates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
