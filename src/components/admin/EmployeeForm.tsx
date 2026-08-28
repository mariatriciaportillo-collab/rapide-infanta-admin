'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function EmployeeForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [firstName, setFirstName] = useState(initialData?.first_name || '')
  const [lastName, setLastName] = useState(initialData?.last_name || '')
  const [mobile, setMobile] = useState(initialData?.mobile || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [branch, setBranch] = useState(initialData?.branch || '')
  const [status, setStatus] = useState(initialData?.status || 'Active')
  
  const [roles, setRoles] = useState<string[]>(initialData?.roles || [])
  const availableRoles = [
    'Service Advisor', 'Mechanic / Technician', 'Senior Mechanic', 
    'Shop Supervisor', 'Branch Manager', 'Cashier', 'Parts / Inventory Staff', 'Admin Staff'
  ]
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      setIsSubmitting(false)
      return
    }
    if (roles.length === 0) {
      setError('Please select at least one role.')
      setIsSubmitting(false)
      return
    }

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      roles,
      branch: branch.trim() || null,
      mobile: mobile.trim() || null,
      email: email.trim() || null,
      status
    }

    let err
    if (initialData?.id) {
      const { error: updateErr } = await supabase.from('employees').update(payload).eq('id', initialData.id)
      err = updateErr
    } else {
      const { error: insertErr } = await supabase.from('employees').insert([payload])
      err = insertErr
    }

    if (err) {
      
      console.error("Database Error:", err);
      if (err.message?.includes('schema cache') || err.code === 'PGRST205' || err.code === 'PGRST204') {
        setError("System configuration error: The Employees database table is currently inaccessible. Please contact the administrator to apply the latest database migrations.");
      } else {
        setError(`Failed to save: ${err.message}`);
      }

      setIsSubmitting(false)
    } else {
      router.push('/admin/employees')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
          <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
          <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g. Infanta" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-slate-300 rounded-md p-2">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">Roles *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableRoles.map(role => (
            <label key={role} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${roles.includes(role) ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <input type="checkbox" checked={roles.includes(role)} onChange={() => toggleRole(role)} className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{role}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" onClick={() => router.push('/admin/employees')} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-md transition">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Employee'}
        </button>
      </div>
    </form>
  )
}
