import { createClient } from '@/utils/supabase/server'
import { LaborLookupClient } from './LaborLookupClient'

export default async function LaborLookupPage() {
  const supabase = await createClient()

  // Fetch all makes and models for the selectors
  const { data: makes } = await supabase.from('vehicle_makes').select('*').order('name')
  const { data: models } = await supabase.from('vehicle_models').select('*').order('name')
  
  // Fetch services for the global lookup
  const { data: services } = await supabase
    .from('labor_services')
    .select(`
      *,
      labor_groups (*),
      labor_categories (*)
    `)
    .eq('is_active', true)
    .order('name')

  // Fetch groups and categories for filters
  const { data: groups } = await supabase.from('labor_groups').select('*').order('name')
  const { data: categories } = await supabase.from('labor_categories').select('*').order('name')

  // Fetch all lookup rates
  const { data: lookupRates, error } = await supabase
    .from('labor_lookup_rates')
    .select(`
      *,
      labor_services (
        *,
        labor_groups (*),
        labor_categories (*)
      ),
      vehicle_makes (*),
      vehicle_models (*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="pb-24">
      {error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
          Error loading labor lookup data: {error.message}. Ensure you have run the `12_labor_lookup_schema.sql` script.
        </div>
      ) : (
        <LaborLookupClient 
          makes={makes || []} 
          models={models || []} 
          services={services || []}
          lookupRates={lookupRates || []} 
        />
      )}
    </div>
  )
}
