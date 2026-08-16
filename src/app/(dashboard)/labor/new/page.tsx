'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { MakeModelSelector } from '@/components/vehicles/MakeModelSelector'
import { ServiceSelector } from '@/components/labor/ServiceSelector'

export default function AddLaborChargePage() {
  const router = useRouter()
  const supabase = createClient()

  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  
  const [laborM, setLaborM] = useState('')
  const [laborAT, setLaborAT] = useState('')
  const [repairCharge, setRepairCharge] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!selectedServiceId) {
      setError("Please select a Service.")
      setIsSubmitting(false)
      return
    }

    // We allow generic charges without a specific vehicle. If a make is selected but not a model, we force them to select a model.
    if (selectedMake && !selectedModel) {
      setError("Please select the specific Model for this Make, or clear the Make to create a generic charge.")
      setIsSubmitting(false)
      return
    }

    let vehicle_model_id = null
    if (selectedMake && selectedModel) {
      const { data: makeData } = await supabase.from('vehicle_makes').select('id').eq('name', selectedMake).single()
      if (makeData) {
        const { data: modelData } = await supabase.from('vehicle_models').select('id').eq('make_id', makeData.id).eq('name', selectedModel).single()
        if (modelData) {
          vehicle_model_id = modelData.id
        }
      }
    }

    const { error: insertError } = await supabase.from('labor_charges').insert({
      service_id: selectedServiceId,
      vehicle_model_id: vehicle_model_id || null,
      labor_m: laborM ? parseFloat(laborM) : null,
      labor_at: laborAT ? parseFloat(laborAT) : null,
      repair_charge: repairCharge ? parseFloat(repairCharge) : null,
      notes: notes.trim() || null
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError("A charge for this specific Service and Vehicle Model combination already exists.")
      } else {
        setError(`Failed to save: ${insertError.message}`)
      }
      setIsSubmitting(false)
      return
    }

    router.push('/labor')
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/labor" className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="text-slate-500" size={24} />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">Add Labor Charge</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* VEHICLE SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Reference Vehicle</h3>
          <p className="text-sm text-slate-500 mb-4">
            Select a vehicle to create a vehicle-specific charge. Leave both empty to create a generic charge applicable to all vehicles.
          </p>
          <MakeModelSelector 
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* SERVICE SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Service</h3>
          <ServiceSelector 
            selectedServiceId={selectedServiceId}
            setSelectedServiceId={setSelectedServiceId}
          />
        </div>

        {/* PRICING SECTION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Charges (₱)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manual Labor (M)</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={laborM}
                onChange={e => setLaborM(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Auto Labor (AT)</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={laborAT}
                onChange={e => setLaborAT(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Repair Charge</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                value={repairCharge}
                onChange={e => setRepairCharge(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 min-h-[100px]"
              placeholder="Any specific conditions or notes for this charge..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link 
            href="/labor"
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
            {isSubmitting ? 'Saving...' : 'Save Charge'}
          </button>
        </div>
      </form>
    </div>
  )
}
