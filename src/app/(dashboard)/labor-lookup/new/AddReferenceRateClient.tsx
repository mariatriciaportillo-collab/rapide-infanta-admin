'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Info } from 'lucide-react'

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

type Props = {
  makes: Make[]
  models: Model[]
  services: Service[]
}

export function AddReferenceRateClient({ makes, models, services }: Props) {
  const router = useRouter()
  const supabase = createClient()

  // Form State
  const [makeId, setMakeId] = useState('')
  const [modelId, setModelId] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [charge, setCharge] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived Options
  const availableModels = useMemo(() => {
    if (!makeId) return []
    return models.filter(m => m.make_id === makeId)
  }, [models, makeId])

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear() + 1
    const years = []
    for (let y = currentYear; y >= 1980; y--) years.push(y)
    return years
  }, [])

  const selectedService = useMemo(() => {
    return services.find(s => s.id === serviceId)
  }, [services, serviceId])

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

    if (checkError) {
      setError(`Validation failed: ${checkError.message}`)
      setIsSubmitting(false)
      return
    }

    const hasOverlap = existingRates?.some(r => {
      // Two ranges overlap if (StartA <= EndB) and (EndA >= StartB)
      return yF <= r.year_to && yT >= r.year_from
    })

    if (hasOverlap) {
      setError("An active Labor Lookup rate already exists for this vehicle, service, and overlapping year range.")
      setIsSubmitting(false)
      return
    }

    // Insert
    const { error: insertError } = await supabase.from('labor_lookup_rates').insert({
      labor_service_id: serviceId,
      vehicle_make_id: makeId,
      vehicle_model_id: modelId,
      year_from: yF,
      year_to: yT,
      reference_charge: parseFloat(charge),
      notes: notes.trim() || null,
      is_active: isActive
    })

    if (insertError) {
      setError(`Failed to save: ${insertError.message}`)
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
        <h2 className="text-2xl font-bold text-slate-800">Add Reference Rate</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
              <select
                value={makeId}
                onChange={e => { setMakeId(e.target.value); setModelId('') }}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select Make...</option>
                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
              <select
                value={modelId}
                onChange={e => setModelId(e.target.value)}
                disabled={!makeId}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select Model...</option>
                {availableModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Labor / Service *</label>
              <select
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white font-medium text-blue-700"
              >
                <option value="">Search or choose service...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

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
              {selectedService?.rate && (
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
