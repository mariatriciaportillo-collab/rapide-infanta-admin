'use client'

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
