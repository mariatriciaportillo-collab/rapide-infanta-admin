'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { GroupCategorySelector } from '@/components/labor/GroupCategorySelector'

export function EditLaborChargeClient({ service }: { service: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [serviceName, setServiceName] = useState(service.name || '')
  const [selectedGroupId, setSelectedGroupId] = useState(service.group_id || '')
  const [selectedCategoryId, setSelectedCategoryId] = useState(service.category_id || '')
  
  const [standardHours, setStandardHours] = useState(service.standard_hours?.toString() || '')
  const [rate, setRate] = useState(service.rate?.toString() || '')
  const [notes, setNotes] = useState(service.notes || '')
  const [isActive, setIsActive] = useState(service.is_active ?? true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!serviceName.trim()) {
      setError("Please enter a Labor / Service name.")
      setIsSubmitting(false)
      return
    }

    if (!selectedGroupId) {
      setError("Please select a Group.")
      setIsSubmitting(false)
      return
    }

    if (!selectedCategoryId) {
      setError("Please select a Category.")
      setIsSubmitting(false)
      return
    }

    if (!rate || isNaN(parseFloat(rate))) {
      setError("Please enter a valid Rate / Price.")
      setIsSubmitting(false)
      return
    }

    const { error: updateError } = await supabase
      .from('labor_services')
      .update({
        name: serviceName.trim(),
        group_id: selectedGroupId,
        category_id: selectedCategoryId,
        standard_hours: standardHours ? parseFloat(standardHours) : null,
        rate: parseFloat(rate),
        notes: notes.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', service.id)

    if (updateError) {
      if (updateError.code === '23505') {
        setError("A service with this name already exists.")
      } else {
        setError(`Failed to update: ${updateError.message}`)
      }
      setIsSubmitting(false)
      return
    }

    router.push('/labor-charges')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/labor-charges" className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="text-slate-500" size={24} />
        </Link>
        <h2 className="text-2xl font-bold text-slate-800">Edit Labor / Service</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
             Service Information
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Labor / Service *</label>
              <input 
                type="text"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g. Drive Shaft Replacement"
              />
            </div>

            <GroupCategorySelector 
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Standard Hour</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    step="0.1"
                    value={standardHours}
                    onChange={e => setStandardHours(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 pr-10 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 2.0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rate / Price of Service *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₱</span>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 pl-8 focus:outline-none focus:border-blue-500 font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 min-h-[80px]"
                placeholder="Optional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={e => setIsActive(e.target.value === 'active')}
                className="w-full md:w-1/3 border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link 
            href="/labor-charges"
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2 disabled:bg-blue-400"
          >
            <Save size={18} />
            {isSubmitting ? 'Updating...' : 'Update Labor'}
          </button>
        </div>
      </form>
    </div>
  )
}
