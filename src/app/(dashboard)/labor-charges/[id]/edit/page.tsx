import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EditLaborChargeClient } from './EditLaborChargeClient'

export default async function EditLaborPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: service, error } = await supabase
    .from('labor_services')
    .select(`
      *,
      labor_groups (*),
      labor_categories (*)
    `)
    .eq('id', id)
    .single()

  if (error || !service) {
    notFound()
  }

  return <EditLaborChargeClient service={service} />
}
