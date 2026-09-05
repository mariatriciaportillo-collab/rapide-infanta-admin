'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Plus, Search, Edit } from 'lucide-react'

export default function EmployeesPage() {
  const supabase = createClient()
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('employees').select('*').order('first_name', { ascending: true })
    if (!error && data) {
      setEmployees(data)
    }
    setLoading(false)
  }

  const filtered = employees.filter(e => 
    e.full_name.toLowerCase().includes(search.toLowerCase()) || 
    (e.roles || []).join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
        <Link href="/admin/employees/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
          <Plus size={20} /> Add Employee
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search employees or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Roles</th>
                <th className="p-4 font-medium">Branch</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No employees found.</td></tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{emp.full_name}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {(emp.roles || []).map((r: string) => (
                          <span key={r} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200">{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{emp.branch || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/employees/${emp.id}/edit`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                        <Edit size={16} /> Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
