import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Wrench, Search, Car } from 'lucide-react'
import { LaborLookupClient } from './LaborLookupClient'

export default async function LaborPage() {
  const supabase = await createClient()

  // Fetch all makes and models for the selector
  const { data: makes } = await supabase.from('vehicle_makes').select('*').order('name')
  const { data: models } = await supabase.from('vehicle_models').select('*').order('name')
  
  // Fetch services for the global lookup
  const { data: services } = await supabase.from('labor_services').select('*').eq('is_active', true).order('name')
  
  // Fetch all charges to allow cross-vehicle lookup
  // We need to join with services, makes, and models
  const { data: charges, error } = await supabase
    .from('labor_charges')
    .select(`
      *,
      labor_services (*),
      vehicle_models (
        *,
        vehicle_makes (*)
      )
    `)
    .eq('is_active', true)

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Labor Charges Reference</h2>
        <Link 
          href="/labor/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Labor Charge
        </Link>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
          Error loading labor data: {error.message}. Ensure you have run the `10_labor_schema.sql` script.
        </div>
      ) : (
        <LaborLookupClient 
          makes={makes || []} 
          models={models || []} 
          services={services || []} 
          charges={charges || []} 
        />
      )}
    </div>
  )
}
