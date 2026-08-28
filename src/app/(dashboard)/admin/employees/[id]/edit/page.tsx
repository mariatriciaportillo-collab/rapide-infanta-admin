'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { EmployeeForm } from '@/components/admin/EmployeeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('employees').select('*').eq('id', id).single()
      setEmployee(data)
      setLoading(false)
    }
    loadData()
  }, [id, supabase])

  if (loading) return <div>Loading...</div>
  if (!employee) return <div>Employee not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/employees" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Edit Employee</h1>
      </div>
      <EmployeeForm initialData={employee} />
    </div>
  )
}
