import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EditLaborLookupClient } from './EditLaborLookupClient'

export default async function EditReferenceRatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rate, error } = await supabase
    .from('labor_lookup_rates')
    .select(`*`)
    .eq('id', id)
    .single()

  if (error || !rate) {
    notFound()
  }

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
    <EditLaborLookupClient 
      rate={rate}
      makes={makes || []}
      models={models || []}
      services={services || []}
    />
  )
}
