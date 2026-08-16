'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Car, Wrench } from 'lucide-react'

// Adjust type based on how you fetch it, this is a simplified type for the form
type Charge = {
  id: string
  labor_m: number | null
  labor_at: number | null
  repair_charge: number | null
  notes: string | null
  labor_services?: { name: string; category: string | null }
  vehicle_models?: { name: string; vehicle_makes?: { name: string } }
}

export function EditLaborChargeClient({ charge }: { charge: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [laborM, setLaborM] = useState(charge.labor_m?.toString() || '')
  const [laborAT, setLaborAT] = useState(charge.labor_at?.toString() || '')
  const [repairCharge, setRepairCharge] = useState(charge.repair_charge?.toString() || '')
  const [notes, setNotes] = useState(charge.notes || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('labor_charges')
      .update({
        labor_m: laborM ? parseFloat(laborM) : null,
        labor_at: laborAT ? parseFloat(laborAT) : null,
        repair_charge: repairCharge ? parseFloat(repairCharge) : null,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', charge.id)

    if (updateError) {
      setError(`Failed to update: ${updateError.message}`)
      setIsSubmitting(false)
      return
    }

    router.push('/labor')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/labor" className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="text-slate-500" size={24} />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">Edit Labor Charge</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* READ ONLY INFO */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Car size={16} /> Reference Vehicle
            </h4>
            <div className="font-medium text-slate-800">
              {charge.vehicle_models 
                ? `${charge.vehicle_models.vehicle_makes?.name} ${charge.vehicle_models.name}`
                : <span className="italic text-slate-500">Generic / All Vehicles</span>
              }
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Wrench size={16} /> Service
            </h4>
            <div className="font-medium text-slate-800">
              {charge.labor_services?.name}
            </div>
            {charge.labor_services?.category && (
              <div className="text-xs text-slate-500 mt-1">{charge.labor_services.category}</div>
            )}
          </div>
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
            {isSubmitting ? 'Updating...' : 'Update Charge'}
          </button>
        </div>
      </form>
    </div>
  )
}
