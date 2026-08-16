'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Info } from 'lucide-react'
import { MakeModelSelector } from '@/components/vehicles/MakeModelSelector'
import { ServiceSelector, LaborService } from '@/components/labor/ServiceSelector'

type Props = {
  rate: any
}

export function EditLaborLookupClient({ rate }: Props) {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [makeId, setMakeId] = useState(rate.vehicle_make_id)
  const [makeName, setMakeName] = useState(rate.vehicle_makes?.name || '')
  
  const [modelId, setModelId] = useState(rate.vehicle_model_id)
  const [modelName, setModelName] = useState(rate.vehicle_models?.name || '')
  
  const [yearFrom, setYearFrom] = useState(rate.year_from.toString())
  const [yearTo, setYearTo] = useState(rate.year_to.toString())
  
  const [serviceId, setServiceId] = useState(rate.labor_service_id)
  const [selectedService, setSelectedService] = useState<LaborService | null>(null)
  
  const [charge, setCharge] = useState(rate.reference_charge.toString())
  const [notes, setNotes] = useState(rate.notes || '')
  const [isActive, setIsActive] = useState(rate.is_active)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the initial selected service to show its group/category contexts
    if (rate.labor_service_id) {
      supabase.from('labor_services')
        .select('*, labor_groups(name), labor_categories(name)')
        .eq('id', rate.labor_service_id)
        .single()
        .then(({ data }) => {
          if (data) setSelectedService(data)
        })
    }
  }, [rate.labor_service_id])

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear() + 1
    const years = []
    for (let y = currentYear; y >= 1980; y--) years.push(y)
    return years
  }, [])

  const handleServiceSelect = (service: LaborService) => {
    setServiceId(service.id)
    setSelectedService(service)
    // Only auto-suggest base rate if charge is empty (unlikely in Edit mode, but good for UX if they clear it)
    if (!charge && service.rate !== null) {
      setCharge(service.rate.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!makeId || !modelId || !yearFrom || !yearTo || !serviceId) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    const yF = parseInt(yearFrom)
    const yT = parseInt(yearTo)

    if (yF > yT) {
      setError("Year From cannot be greater than Year To.")
      setIsSubmitting(false)
      return
    }

    if (!charge || isNaN(parseFloat(charge))) {
      setError("Please enter a valid Reference Charge.")
      setIsSubmitting(false)
      return
    }

    // Overlap Protection
    const { data: existingRates, error: checkError } = await supabase
      .from('labor_lookup_rates')
      .select('id, year_from, year_to')
      .eq('labor_service_id', serviceId)
      .eq('vehicle_model_id', modelId)
      .eq('is_active', true)
      .neq('id', rate.id) // Exclude current record

    if (checkError) {
      setError(`Validation failed: ${checkError.message}`)
      setIsSubmitting(false)
      return
    }

    const hasOverlap = existingRates?.some(r => {
      // Two ranges overlap if (StartA <= EndB) and (EndA >= StartB)
      return yF <= r.year_to && yT >= r.year_from
    })

    if (hasOverlap && isActive) {
      setError("An active Labor Lookup rate already exists for this vehicle, service, and overlapping year range.")
      setIsSubmitting(false)
      return
    }

    // Update
    const { error: updateError } = await supabase
      .from('labor_lookup_rates')
      .update({
        labor_service_id: serviceId,
        vehicle_make_id: makeId,
        vehicle_model_id: modelId,
        year_from: yF,
        year_to: yT,
        reference_charge: parseFloat(charge),
        notes: notes.trim() || null,
        is_active: isActive
      })
      .eq('id', rate.id)

    if (updateError) {
      setError(`Failed to save: ${updateError.message}`)
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
        <h2 className="text-2xl font-bold text-slate-800">Edit Reference Rate</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
             Vehicle Information
          </h3>
          <div className="mb-6">
            <MakeModelSelector
              selectedMake={makeName}
              setSelectedMake={setMakeName}
              selectedModel={modelName}
              setSelectedModel={setModelName}
              onMakeSelect={(id) => setMakeId(id)}
              onModelSelect={(id) => setModelId(id)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year From *</label>
              <select
                value={yearFrom}
                onChange={e => {
                  setYearFrom(e.target.value)
                  if (!yearTo || parseInt(e.target.value) > parseInt(yearTo)) {
                    setYearTo(e.target.value)
                  }
                }}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select...</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year To *</label>
              <select
                value={yearTo}
                onChange={e => setYearTo(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select...</option>
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
             Labor & Pricing
          </h3>
          <div className="space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference Charge *</label>
              <div className="relative md:w-1/2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₱</span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={charge}
                  onChange={e => setCharge(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 pl-8 focus:outline-none focus:border-blue-500 font-bold text-lg text-blue-700"
                  placeholder="0.00"
                />
              </div>
              {selectedService?.rate !== undefined && selectedService?.rate !== null && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <Info size={14}/> General Base Rate for this service is ₱{selectedService.rate.toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 min-h-[80px]"
                placeholder="Optional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={e => setIsActive(e.target.value === 'active')}
                className="w-full md:w-1/3 border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link 
            href="/labor-lookup"
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2 disabled:bg-blue-400"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Rate'}
          </button>
        </div>
      </form>
    </div>
  )
}
