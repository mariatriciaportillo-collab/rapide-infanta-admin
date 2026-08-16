import { createClient } from '@/utils/supabase/server'
import { AddReferenceRateClient } from './AddReferenceRateClient'

export default async function AddReferenceRatePage() {
  const supabase = await createClient()

  const { data: makes } = await supabase.from('vehicle_makes').select('*').order('name')
  const { data: models } = await supabase.from('vehicle_models').select('*').order('name')
  
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
    <AddReferenceRateClient 
      makes={makes || []}
      models={models || []}
      services={services || []}
    />
  )
}
