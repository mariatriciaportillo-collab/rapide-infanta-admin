import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LaborChargesClient } from './LaborChargesClient'

export default async function LaborPage() {
  const supabase = await createClient()

  // Fetch groups and categories for filters
  const { data: groups } = await supabase.from('labor_groups').select('*').order('name')
  const { data: categories } = await supabase.from('labor_categories').select('*').order('name')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-slate-900">Labor Charges</h1>
        <Link 
          href="/labor-charges/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add Labor
        </Link>
      </div>

      <LaborChargesClient 
        groups={groups || []} 
        categories={categories || []} 
      />
    </div>
  )
}
