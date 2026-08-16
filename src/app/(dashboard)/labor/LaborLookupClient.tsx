'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Car, Wrench, Edit, Info, AlertCircle } from 'lucide-react'
import { MakeModelSelector } from '@/components/vehicles/MakeModelSelector'

type Make = { id: string; name: string }
type Model = { id: string; make_id: string; name: string }
type Service = { id: string; name: string; category: string | null }
type Charge = {
  id: string
  service_id: string
  vehicle_model_id: string | null
  labor_m: number | null
  labor_at: number | null
  repair_charge: number | null
  notes: string | null
  labor_services?: Service
  vehicle_models?: Model & { vehicle_makes?: Make }
}

type Props = {
  makes: Make[]
  models: Model[]
  services: Service[]
  charges: Charge[]
}

export function LaborLookupClient({ makes, models, services, charges }: Props) {
  // Global Quick Lookup State
  const [quickSearch, setQuickSearch] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  // Derived state for the selected vehicle
  const activeMake = useMemo(() => makes.find(m => m.name === selectedMake), [makes, selectedMake])
  const activeModel = useMemo(() => models.find(m => m.name === selectedModel && m.make_id === activeMake?.id), [models, selectedModel, activeMake])

  // Filter charges for the table
  const filteredCharges = useMemo(() => {
    let result = charges

    // Filter by vehicle if selected
    if (activeModel) {
      result = result.filter(c => c.vehicle_model_id === activeModel.id || c.vehicle_model_id === null)
    }

    // Filter by search
    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase()
      result = result.filter(c => 
        c.labor_services?.name.toLowerCase().includes(q) ||
        c.labor_services?.category?.toLowerCase().includes(q) ||
        c.vehicle_models?.name.toLowerCase().includes(q) ||
        c.vehicle_models?.vehicle_makes?.name.toLowerCase().includes(q)
      )
    }

    // Sort by category then service name
    return result.sort((a, b) => {
      const catA = a.labor_services?.category || 'Z'
      const catB = b.labor_services?.category || 'Z'
      if (catA !== catB) return catA.localeCompare(catB)
      return (a.labor_services?.name || '').localeCompare(b.labor_services?.name || '')
    })
  }, [charges, activeModel, quickSearch])

  // Stats for the selected vehicle
  const selectedVehicleCharges = useMemo(() => {
    if (!activeModel) return []
    return charges.filter(c => c.vehicle_model_id === activeModel.id)
  }, [charges, activeModel])

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
    return `₱${val.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* QUICK LOOKUP SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="text-blue-500" size={20} />
          <h3 className="font-bold text-slate-800 text-lg">Quick Labor Lookup</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <MakeModelSelector 
              selectedMake={selectedMake}
              setSelectedMake={setSelectedMake}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance / Service</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 pl-9 focus:outline-none focus:border-blue-500"
                  placeholder="Type to filter services..."
                />
              </div>
            </div>
          </div>
        </div>

        {activeModel && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">Selected Reference Vehicle</h4>
              <div className="text-xl font-black text-blue-700 flex items-center gap-2">
                <Car size={24} />
                {activeMake?.name} {activeModel.name}
              </div>
            </div>
            <div className="flex gap-6 text-sm text-blue-800">
              <div>
                <div className="text-blue-600/70 font-medium">Recorded Services</div>
                <div className="font-bold text-lg">{selectedVehicleCharges.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHARGES TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Wrench size={18} className="text-slate-500"/>
            Labor & Charges List
          </h3>
          <div className="text-sm text-slate-500">
            {filteredCharges.length} {filteredCharges.length === 1 ? 'record' : 'records'} found
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Vehicle Model</th>
                <th className="px-6 py-3 text-right">Labor M</th>
                <th className="px-6 py-3 text-right">Labor AT</th>
                <th className="px-6 py-3 text-right">Repair Chg</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                    No labor charges found matching your criteria.<br/>
                    {activeModel && (
                      <Link href="/labor/new" className="text-blue-600 hover:underline mt-2 inline-block">
                        Add a charge for {activeMake?.name} {activeModel.name}
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCharges.map(charge => (
                  <tr key={charge.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{charge.labor_services?.name}</div>
                      {charge.labor_services?.category && (
                        <div className="text-xs font-medium text-slate-500 mt-0.5 bg-slate-100 inline-block px-1.5 py-0.5 rounded">
                          {charge.labor_services.category}
                        </div>
                      )}
                      {charge.notes && (
                        <div className="text-xs text-slate-400 mt-1 flex items-start gap-1 max-w-xs">
                          <Info size={12} className="mt-0.5 shrink-0" />
                          <span className="truncate">{charge.notes}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {charge.vehicle_models ? (
                        <span className="font-medium">
                          {charge.vehicle_models.vehicle_makes?.name} {charge.vehicle_models.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs bg-slate-100 px-2 py-1 rounded">Generic / All Vehicles</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {formatCurrency(charge.labor_m)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {formatCurrency(charge.labor_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {formatCurrency(charge.repair_charge)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/labor/${charge.id}/edit`} 
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded inline-flex transition"
                        title="Edit Charge"
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
