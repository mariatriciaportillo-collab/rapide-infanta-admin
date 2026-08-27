import re

# 1. Update LaborLookupClient.tsx
content = """'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Edit, Plus, Wrench, Car } from 'lucide-react'
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

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null
    return services.find(s => s.id === selectedServiceId) || null
  }, [selectedServiceId, services])

  const availableModelsForLabor = useMemo(() => {
    if (!filterMakeId) return []
    return models.filter(m => m.make_id === filterMakeId)
  }, [models, filterMakeId])

  // Deduplicate service rates by Make + Model + Service for display safety
  const serviceRates = useMemo(() => {
    if (!selectedServiceId) return []
    let result = lookupRates.filter(r => r.labor_service_id === selectedServiceId)

    if (filterMakeId) result = result.filter(r => r.vehicle_make_id === filterMakeId)
    if (filterModelId) result = result.filter(r => r.vehicle_model_id === filterModelId)

    // Deduplicate on Make+Model
    const seen = new Set<string>()
    const deduplicated = []
    
    // Sort by Make, then Model to keep order deterministic before deduplication
    result.sort((a, b) => {
      const makeCompare = a.vehicle_makes.name.localeCompare(b.vehicle_makes.name)
      if (makeCompare !== 0) return makeCompare
      return a.vehicle_models.name.localeCompare(b.vehicle_models.name)
    })

    for (const r of result) {
      const key = `${r.vehicle_make_id}_${r.vehicle_model_id}`
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(r)
      }
    }

    return deduplicated
  }, [lookupRates, selectedServiceId, filterMakeId, filterModelId])


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

  const vehicleRates = useMemo(() => {
    if (!vehMakeId || !vehModelId) return []
    
    let result = lookupRates.filter(r => 
      r.vehicle_make_id === vehMakeId && 
      r.vehicle_model_id === vehModelId
    )

    // Deduplicate on Service for this Make/Model
    const seen = new Set<string>()
    const deduplicated = []
    
    result.sort((a, b) => a.labor_services.name.localeCompare(b.labor_services.name))

    for (const r of result) {
      if (!seen.has(r.labor_service_id)) {
        seen.add(r.labor_service_id)
        deduplicated.push(r)
      }
    }

    return deduplicated
  }, [lookupRates, vehMakeId, vehModelId])


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
                          <th className="px-6 py-3 text-right">Labor MT</th>
                          <th className="px-6 py-3 text-right">Labor AT</th>
                          <th className="px-6 py-3 text-center w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {serviceRates.map(rate => (
                          <tr key={rate.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-bold text-slate-800">{rate.vehicle_makes.name}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">{rate.vehicle_models.name}</td>
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
                
                <div className="flex-1 w-full">
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
              </div>
            </div>

            {selectedVehicleName ? (
              <div className="p-6">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Car size={24} className="text-blue-600" />
                    {selectedVehicleName}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Labor references saved for this vehicle</p>
                </div>

                {vehicleRates.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <p className="text-slate-600 font-medium mb-4">No labor reference rates have been added for this vehicle yet.</p>
                    <Link 
                      href={`/labor-lookup/new?make_id=${vehMakeId}&model_id=${vehModelId}`}
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
                <p className="text-sm mt-2 text-slate-500">Select the Make and Model above to view labor rates.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
"""

with open('src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx', 'w') as f:
    f.write(content)

# 2. Update AddReferenceRateClient.tsx
content2 = """'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { MakeModelSelector } from '@/components/vehicles/MakeModelSelector'
import { ServiceSelector, LaborService } from '@/components/labor/ServiceSelector'

export function AddReferenceRateClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Form State
  const [makeId, setMakeId] = useState(searchParams.get('make_id') || '')
  const [makeName, setMakeName] = useState('')
  const [modelId, setModelId] = useState(searchParams.get('model_id') || '')
  const [modelName, setModelName] = useState('')
  
  const [serviceId, setServiceId] = useState(searchParams.get('service_id') || '')
  const [selectedService, setSelectedService] = useState<LaborService | null>(null)
  
  const [laborManual, setLaborManual] = useState('')
  const [laborAutomatic, setLaborAutomatic] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleServiceSelect = (service: LaborService) => {
    setServiceId(service.id)
    setSelectedService(service)
    if (!laborManual && !laborAutomatic && service.rate !== null) {
      setLaborManual(service.rate.toString())
      setLaborAutomatic(service.rate.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!makeId || !modelId || !serviceId) {
      setError("Please fill in all required fields (Make, Model, Labor / Service).")
      setIsSubmitting(false)
      return
    }

    if (!laborManual && !laborAutomatic) {
      setError("Please enter at least one Labor Charge (Manual or Automatic).")
      setIsSubmitting(false)
      return
    }

    const lm = laborManual ? parseFloat(laborManual) : null
    const la = laborAutomatic ? parseFloat(laborAutomatic) : null

    if ((laborManual && isNaN(lm!)) || (laborAutomatic && isNaN(la!))) {
      setError("Please enter valid numeric Labor Charges.")
      setIsSubmitting(false)
      return
    }

    // Overlap Protection - Avoid duplicate Make+Model+Service
    const { data: existingRates, error: checkError } = await supabase
      .from('labor_lookup_rates')
      .select('id')
      .eq('labor_service_id', serviceId)
      .eq('vehicle_model_id', modelId)
      .eq('is_active', true)

    if (checkError) {
      setError(`Validation failed: ${checkError.message}`)
      setIsSubmitting(false)
      return
    }

    if (existingRates && existingRates.length > 0) {
      setError("An active Labor Lookup rate already exists for this vehicle Make and Model for this service.")
      setIsSubmitting(false)
      return
    }

    // Insert with default years to satisfy DB if required
    const { error: insertError } = await supabase.from('labor_lookup_rates').insert({
      labor_service_id: serviceId,
      vehicle_make_id: makeId,
      vehicle_model_id: modelId,
      year_from: 1900,
      year_to: 9999,
      labor_manual: lm,
      labor_automatic: la,
      notes: notes.trim() || null,
      is_active: isActive
    })

    if (insertError) {
      setError(`Failed to save rate: ${insertError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/labor-lookup')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/labor-lookup" className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="text-slate-500" size={24} />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">Add Vehicle Labor Rate</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* LABOR SERVICE */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
             Labor / Service
          </h3>
          <div className="space-y-4">
            <ServiceSelector
              selectedServiceId={serviceId}
              setSelectedServiceId={setServiceId}
              onServiceSelect={handleServiceSelect}
            />

            {selectedService && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex gap-4 text-sm">
                <div><span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Group</span>{selectedService.labor_groups?.name || '-'}</div>
                <div><span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Category</span>{selectedService.labor_categories?.name || '-'}</div>
                <div><span className="font-semibold text-slate-500 uppercase text-xs block mb-1">Std Hrs</span>{selectedService.standard_hours || '-'}</div>
              </div>
            )}
          </div>
        </div>

        {/* VEHICLE */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
             Vehicle Information
          </h3>
          <div className="mb-2">
            <MakeModelSelector
              selectedMake={makeName}
              setSelectedMake={setMakeName}
              selectedModel={modelName}
              setSelectedModel={setModelName}
              onMakeSelect={(id) => setMakeId(id)}
              onModelSelect={(id) => setModelId(id)}
            />
          </div>
        </div>

        {/* PRICING */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
             Labor Rate
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Manual Transmission Rate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-medium">₱</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={laborManual}
                  onChange={e => setLaborManual(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Automatic Transmission Rate</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-medium">₱</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={laborAutomatic}
                  onChange={e => setLaborAutomatic(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific conditions or notes for this vehicle rate..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link 
            href="/labor-lookup" 
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Vehicle Labor Rate'}
          </button>
        </div>
      </form>
    </div>
  )
}
"""

with open('src/app/(dashboard)/labor-lookup/new/AddReferenceRateClient.tsx', 'w') as f:
    f.write(content2)

