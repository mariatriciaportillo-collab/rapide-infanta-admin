import { createClient } from '@/utils/supabase/server'
import { PartsLookupClient } from './PartsLookupClient'

export default async function PartsLookupPage() {
  const supabase = await createClient()

  // Fetch all makes and models for the selectors
  const { data: makes } = await supabase.from('vehicle_makes').select('*').order('name')
  const { data: models } = await supabase.from('vehicle_models').select('*').order('name')
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PartsLookupClient 
        makes={makes || []} 
        models={models || []} 
      />
    </div>
  )
}
