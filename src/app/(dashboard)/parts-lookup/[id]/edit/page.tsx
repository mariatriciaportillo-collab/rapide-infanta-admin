import { createClient } from '@/utils/supabase/server'
import { PartsLookupForm } from '@/components/parts/PartsLookupForm'
import { notFound } from 'next/navigation'

export default async function EditPartsLookupPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: lookup } = await supabase.from('part_lookups').select('*').eq('id', params.id).single()
  if (!lookup) {
    notFound()
  }

  const { data: makes } = await supabase.from('vehicle_makes').select('*').order('name')
  const { data: models } = await supabase.from('vehicle_models').select('*').order('name')
  const { data: parts } = await supabase.from('parts').select('id, name, part_number, brands(name)').eq('is_active', true).order('name')
  
  return (
    <div className="max-w-4xl mx-auto pb-24">
      <PartsLookupForm 
        makes={makes || []} 
        models={models || []}
        parts={parts || []}
        initialData={lookup}
      />
    </div>
  )
}
