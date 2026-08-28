import { EmployeeForm } from '@/components/admin/EmployeeForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewEmployeePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/employees" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Add New Employee</h1>
      </div>
      <EmployeeForm />
    </div>
  )
}
