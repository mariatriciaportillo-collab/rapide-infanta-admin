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
    .select(`
      *,
      vehicle_makes(name),
      vehicle_models(name),
      labor_services(name)
    `)
    .eq('id', id)
    .single()

  if (error || !rate) {
    notFound()
  }

  return (
    <EditLaborLookupClient rate={rate} />
  )
}
