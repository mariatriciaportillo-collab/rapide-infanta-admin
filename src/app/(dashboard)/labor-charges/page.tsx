import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LaborChargesClient } from './LaborChargesClient'

export default async function LaborPage() {
  const supabase = await createClient()

  // Fetch groups and categories for filters
  const { data: groups } = await supabase.from('labor_groups').select('*').order('name')
  const { data: categories } = await supabase.from('labor_categories').select('*').order('name')
  
  // Fetch services for the master list
  const { data: services, error } = await supabase
    .from('labor_services')
    .select(`
      *,
      labor_groups (*),
      labor_categories (*)
    `)
    .order('name')

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Labor Charges</h2>
        <Link 
          href="/labor-charges/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Labor
        </Link>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
          Error loading labor data: {error.message}. Ensure you have run the `11_labor_master_restructure.sql` script.
        </div>
      ) : (
        <LaborChargesClient 
          groups={groups || []} 
          categories={categories || []} 
          services={services || []} 
        />
      )}
    </div>
  )
}
