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

  return (
    <div className="pb-24">
      <LaborLookupClient 
        makes={makes || []} 
        models={models || []} 
        services={services || []}
      />
    </div>
  )
}
