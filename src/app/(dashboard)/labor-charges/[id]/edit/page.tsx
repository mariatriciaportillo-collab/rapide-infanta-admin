import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EditLaborChargeClient } from './EditLaborChargeClient'

export default async function EditLaborChargePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: charge, error } = await supabase
    .from('labor_charges')
    .select(`
      *,
      labor_services (*),
      vehicle_models (
        *,
        vehicle_makes (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !charge) {
    notFound()
  }

  return <EditLaborChargeClient charge={charge} />
}
