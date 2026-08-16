'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Edit, Info, AlertCircle, Wrench, Car, Plus } from 'lucide-react'

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

export function LaborLookupClient({ makes, models, services, groups, categories, lookupRates }: Props) {
  // === QUICK LOOKUP STATE ===
  const [qlVehicleId, setQlVehicleId] = useState('') // This will hold "makeId_modelId"
  const [qlServiceId, setQlServiceId] = useState('')

  // Create flattened vehicles list for the single dropdown
  const combinedVehicles = useMemo(() => {
    const list: { id: string, makeId: string, modelId: string, name: string }[] = []
    models.forEach(model => {
      const make = makes.find(m => m.id === model.make_id)
      if (make) {
        list.push({
          id: `${make.id}_${model.id}`,
          makeId: make.id,
          modelId: model.id,
          name: `${make.name} ${model.name}`
        })
      }
    })
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [makes, models])

  // Quick Lookup Result Calculation
  const activeRate = useMemo(() => {
    if (!qlVehicleId || !qlServiceId) return null
    
    const [makeId, modelId] = qlVehicleId.split('_')

    // Find the specific rate matching the criteria
    // Since Year is removed from UI, we just grab the first matching active rate.
    // In the future, if Year becomes important, we handle it as an exception.
    return lookupRates.find(r => 
      r.vehicle_make_id === makeId &&
      r.vehicle_model_id === modelId &&
      r.labor_service_id === qlServiceId &&
      r.is_active === true
    )
  }, [qlVehicleId, qlServiceId, lookupRates])

  const selectedService = useMemo(() => {
    if (!qlServiceId) return null
    return services.find(s => s.id === qlServiceId) || null
  }, [qlServiceId, services])

  const renderQuickLookupResult = () => {
    if (!qlVehicleId) {
      return <div className="text-center text-slate-500 py-6 italic">Select a vehicle.</div>
    }
    if (!qlServiceId) {
      return <div className="text-center text-slate-500 py-6 italic">Select a Labor / Service to view the reference charge.</div>
    }

    const selectedVehicle = combinedVehicles.find(v => v.id === qlVehicleId)
    const [makeId, modelId] = qlVehicleId.split('_')

    if (activeRate) {
      return (
        <div className="border border-slate-300 rounded-lg p-6 shadow-sm">
          <div className="text-sm uppercase tracking-wide font-bold text-slate-500 mb-4">REFERENCE LABOR CHARGE</div>
          <div className="mb-6 border-b border-slate-100 pb-4">
            <div className="text-xl font-bold text-slate-800">{selectedService?.name}</div>
            <div className="text-slate-600 font-medium uppercase mt-1">{selectedVehicle?.name}</div>
          </div>
          
          <div className="flex flex-wrap gap-8 mb-6">
            <div className="min-w-[150px]">
              <div className="text-xs font-bold text-slate-400 tracking-wider mb-1">LABOR M</div>
              <div className="text-3xl font-black text-slate-800">
                {activeRate.labor_manual ? formatCurrency(activeRate.labor_manual) : <span className="text-slate-300 font-medium">—</span>}
              </div>
            </div>
            <div className="min-w-[150px]">
              <div className="text-xs font-bold text-slate-400 tracking-wider mb-1">LABOR AT</div>
              <div className="text-3xl font-black text-slate-800">
                {activeRate.labor_automatic ? formatCurrency(activeRate.labor_automatic) : <span className="text-slate-300 font-medium">—</span>}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-2 bg-slate-50 p-4 rounded-md">
            <div><span className="font-medium text-slate-800">Group:</span> {selectedService?.labor_groups?.name || '-'}</div>
            <div><span className="font-medium text-slate-800">Category:</span> {selectedService?.labor_categories?.name || '-'}</div>
            <div><span className="font-medium text-slate-800">Standard Hour:</span> {selectedService?.standard_hours ? `${selectedService.standard_hours} hrs` : '-'}</div>
          </div>
          {activeRate.notes && (
            <div className="mt-4 text-sm italic text-slate-500 flex items-start gap-1">
              <Info size={14} className="mt-0.5 shrink-0"/> {activeRate.notes}
            </div>
          )}
        </div>
      )
    }

    if (selectedService?.rate) {
      return (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide font-bold text-amber-700 mb-4">
            <AlertCircle size={16} /> NO VEHICLE-SPECIFIC RATE FOUND
          </div>
          <div className="text-slate-800 mb-6">
            No vehicle-specific reference rate has been configured for <br/>
            <strong>{selectedVehicle?.name}</strong>.
          </div>
          <div className="bg-white border border-amber-100 p-4 rounded-md inline-block">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">General Labor Rate</div>
            <div className="text-2xl font-bold text-slate-700">{formatCurrency(selectedService.rate)}</div>
          </div>
        </div>
      )
    }

    return (
      <div className="border border-slate-300 bg-slate-50 rounded-lg p-8 shadow-sm text-center">
        <div className="text-slate-600 mb-6 font-medium text-lg">No labor charge configured.</div>
        <Link 
          href={`/labor-lookup/new?make_id=${makeId}&model_id=${modelId}&service_id=${qlServiceId}`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition"
        >
          <Plus size={18} />
          Add Reference Rate
        </Link>
      </div>
    )
  }

  // === MANAGEMENT TABLE STATE ===
  const [search, setSearch] = useState('')
  const [filterMakeId, setFilterMakeId] = useState('')
  const [filterModelId, setFilterModelId] = useState('')
  const [filterGroupId, setFilterGroupId] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [filterServiceId, setFilterServiceId] = useState('')

  const filterAvailableModels = useMemo(() => {
    if (!filterMakeId) return []
    return models.filter(m => m.make_id === filterMakeId)
  }, [models, filterMakeId])

  const filterAvailableCategories = useMemo(() => {
    if (!filterGroupId) return []
    return categories.filter(c => c.group_id === filterGroupId)
  }, [categories, filterGroupId])

  // Filtered Management Table Results
  const filteredRates = useMemo(() => {
    let result = lookupRates

    if (filterMakeId) result = result.filter(r => r.vehicle_make_id === filterMakeId)
    if (filterModelId) result = result.filter(r => r.vehicle_model_id === filterModelId)
    if (filterGroupId) result = result.filter(r => r.labor_services.group_id === filterGroupId)
    if (filterCategoryId) result = result.filter(r => r.labor_services.category_id === filterCategoryId)
    if (filterServiceId) result = result.filter(r => r.labor_service_id === filterServiceId)
    
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r => 
        r.labor_services.name.toLowerCase().includes(q) ||
        r.vehicle_makes.name.toLowerCase().includes(q) ||
        r.vehicle_models.name.toLowerCase().includes(q)
      )
    }

    return result
  }, [lookupRates, filterMakeId, filterModelId, filterGroupId, filterCategoryId, filterServiceId, search])

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return `₱${val.toLocaleString()}`
  }

  return (
    <div className="space-y-10">
      {/* QUICK LOOKUP WIDGET */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-slate-800 text-white p-4 font-bold flex items-center gap-2">
          <Search size={20} />
          QUICK LABOR LOOKUP
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
              <select
                value={qlVehicleId}
                onChange={e => setQlVehicleId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-3 focus:outline-none focus:border-blue-500 bg-white font-medium shadow-sm"
              >
                <option value="">Select or search vehicle...</option>
                {combinedVehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance / Service</label>
              <select
                value={qlServiceId}
                onChange={e => setQlServiceId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-3 focus:outline-none focus:border-blue-500 bg-white font-medium text-blue-700 shadow-sm"
              >
                <option value="">Search or choose service...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Quick Lookup Result Panel */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            {renderQuickLookupResult()}
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Labor Lookup Management</h2>
        <Link 
          href="/labor-lookup/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Reference Rate
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Search Service</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-1.5 pl-8 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Search labor/services..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Make</label>
            <select 
              value={filterMakeId}
              onChange={e => { setFilterMakeId(e.target.value); setFilterModelId('') }}
              className="w-full border border-slate-300 rounded-md p-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Makes</option>
              {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Model</label>
            <select 
              value={filterModelId}
              onChange={e => setFilterModelId(e.target.value)}
              disabled={!filterMakeId}
              className="w-full border border-slate-300 rounded-md p-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">All Models</option>
              {filterAvailableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Labor Service (Exact)</label>
            <select 
              value={filterServiceId}
              onChange={e => setFilterServiceId(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Services</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Group Filter</label>
            <select 
              value={filterGroupId}
              onChange={e => { setFilterGroupId(e.target.value); setFilterCategoryId('') }}
              className="w-full border border-slate-300 rounded-md p-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Groups</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category Filter</label>
            <select 
              value={filterCategoryId}
              onChange={e => setFilterCategoryId(e.target.value)}
              disabled={!filterGroupId}
              className="w-full border border-slate-300 rounded-md p-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">All Categories</option>
              {filterAvailableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SERVICES TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Car size={18} className="text-slate-500"/>
            Vehicle-Specific Reference Rates
          </h3>
          <div className="text-sm text-slate-500">
            {filteredRates.length} {filteredRates.length === 1 ? 'record' : 'records'} found
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Labor / Service</th>
                <th className="px-4 py-3">Group & Category</th>
                <th className="px-4 py-3 text-right">LABOR M</th>
                <th className="px-4 py-3 text-right">LABOR AT</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                    No reference rates found matching your criteria.<br/>
                  </td>
                </tr>
              ) : (
                filteredRates.map(rate => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{rate.vehicle_makes.name} {rate.vehicle_models.name}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{rate.labor_services.name}</div>
                      {rate.notes && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{rate.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs leading-tight">
                      <div><span className="font-semibold text-slate-600">G:</span> {rate.labor_services.labor_groups?.name || '-'}</div>
                      <div><span className="font-semibold text-slate-600">C:</span> {rate.labor_services.labor_categories?.name || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-700 text-sm">
                      {rate.labor_manual ? formatCurrency(rate.labor_manual) : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-700 text-sm">
                      {rate.labor_automatic ? formatCurrency(rate.labor_automatic) : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        href={`/labor-lookup/${rate.id}/edit`} 
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded inline-flex transition"
                        title="Edit Reference Rate"
                      >
                        <Edit size={16} />
                      </Link>
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
