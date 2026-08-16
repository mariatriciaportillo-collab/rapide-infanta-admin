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
  reference_charge: number
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
  const [qlMakeId, setQlMakeId] = useState('')
  const [qlModelId, setQlModelId] = useState('')
  const [qlYear, setQlYear] = useState('')
  const [qlServiceId, setQlServiceId] = useState('')

  // Derived available dropdown options
  const qlAvailableModels = useMemo(() => {
    if (!qlMakeId) return []
    return models.filter(m => m.make_id === qlMakeId)
  }, [models, qlMakeId])

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear() + 1 // allow up to next year
    const years = []
    for (let y = currentYear; y >= 1980; y--) years.push(y)
    return years
  }, [])

  // Quick Lookup Result Calculation
  const quickLookupResult = useMemo(() => {
    if (!qlMakeId || !qlModelId || !qlYear || !qlServiceId) return null
    
    const yearInt = parseInt(qlYear)
    if (isNaN(yearInt)) return null

    const service = services.find(s => s.id === qlServiceId)
    if (!service) return null

    // Find the specific rate matching the criteria
    const rate = lookupRates.find(r => 
      r.vehicle_make_id === qlMakeId &&
      r.vehicle_model_id === qlModelId &&
      r.labor_service_id === qlServiceId &&
      r.is_active === true &&
      yearInt >= r.year_from && 
      yearInt <= r.year_to
    )

    return { service, rate }
  }, [qlMakeId, qlModelId, qlYear, qlServiceId, lookupRates, services])

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Make</label>
              <select
                value={qlMakeId}
                onChange={e => { setQlMakeId(e.target.value); setQlModelId('') }}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select Make...</option>
                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Model</label>
              <select
                value={qlModelId}
                onChange={e => setQlModelId(e.target.value)}
                disabled={!qlMakeId}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select Model...</option>
                {qlAvailableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year Model</label>
              <select
                value={qlYear}
                onChange={e => setQlYear(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select Year...</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Labor / Service</label>
              <select
                value={qlServiceId}
                onChange={e => setQlServiceId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white font-medium text-blue-700"
              >
                <option value="">Search or choose service...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Quick Lookup Result Panel */}
          {quickLookupResult && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              {quickLookupResult.rate ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{quickLookupResult.service.name}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div><span className="font-medium">Vehicle:</span> {makes.find(m=>m.id === qlMakeId)?.name} {models.find(m=>m.id === qlModelId)?.name} ({qlYear})</div>
                      <div><span className="font-medium">Group:</span> {quickLookupResult.service.labor_groups?.name || 'Unassigned'}</div>
                      <div><span className="font-medium">Category:</span> {quickLookupResult.service.labor_categories?.name || 'Unassigned'}</div>
                      <div><span className="font-medium">Standard Hour:</span> {quickLookupResult.service.standard_hours || '-'} hrs</div>
                    </div>
                    {quickLookupResult.rate.notes && (
                      <div className="mt-3 text-sm italic text-slate-500 flex items-start gap-1">
                        <Info size={14} className="mt-0.5 shrink-0"/> {quickLookupResult.rate.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-w-[200px]">
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Reference Labor Charge</div>
                    <div className="text-4xl font-black text-blue-600">{formatCurrency(quickLookupResult.rate.reference_charge)}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                      <AlertCircle size={20} /> NO VEHICLE-SPECIFIC RATE
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{quickLookupResult.service.name}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div><span className="font-medium">Vehicle:</span> {makes.find(m=>m.id === qlMakeId)?.name} {models.find(m=>m.id === qlModelId)?.name} ({qlYear})</div>
                      <div className="mt-2 text-amber-700">No vehicle-specific labor charge is configured for this exact vehicle and year.</div>
                    </div>
                  </div>
                  {quickLookupResult.service.rate ? (
                    <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-w-[200px]">
                      <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">General Labor Rate</div>
                      <div className="text-3xl font-bold text-slate-700">{formatCurrency(quickLookupResult.service.rate)}</div>
                    </div>
                  ) : (
                    <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-w-[200px] text-slate-400 font-medium">
                      No Base Rate Available
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Make</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3 text-center">Years</th>
                <th className="px-4 py-3">Labor / Service</th>
                <th className="px-4 py-3">Group & Category</th>
                <th className="px-4 py-3 text-right">Ref. Charge</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                    No reference rates found matching your criteria.<br/>
                  </td>
                </tr>
              ) : (
                filteredRates.map(rate => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{rate.vehicle_makes.name}</td>
                    <td className="px-4 py-3 text-slate-800">{rate.vehicle_models.name}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-500">
                      {rate.year_from === rate.year_to ? rate.year_from : `${rate.year_from}–${rate.year_to}`}
                    </td>
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
                    <td className="px-4 py-3 text-right font-black text-blue-600 text-base">
                      {formatCurrency(rate.reference_charge)}
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
