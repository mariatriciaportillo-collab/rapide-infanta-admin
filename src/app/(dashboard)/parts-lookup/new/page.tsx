import { createClient } from '@/utils/supabase/server'
import { PartsLookupForm } from '@/components/parts/PartsLookupForm'

export default async function NewPartsLookupPage() {
  const supabase = await createClient()

  const { data: makes } = await supabase.from('vehicle_makes').select('*').order('name')
  const { data: models } = await supabase.from('vehicle_models').select('*').order('name')
  const { data: parts } = await supabase.from('parts_materials').select('id, name, item_code, brand').eq('is_active', true).order('name')
  
  return (
    <div className="max-w-4xl mx-auto pb-24">
      <PartsLookupForm 
        makes={makes || []} 
        models={models || []}
        parts={parts || []}
      />
    </div>
  )
}
