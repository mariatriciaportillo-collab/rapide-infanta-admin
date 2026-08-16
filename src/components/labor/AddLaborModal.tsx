'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Save } from 'lucide-react'
import { GroupCategorySelector } from './GroupCategorySelector'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (laborService: any) => void
  initialName?: string
}

export function AddLaborModal({ isOpen, onClose, onSuccess, initialName = '' }: Props) {
  const supabase = createClient()
  
  const [name, setName] = useState(initialName)
  const [groupId, setGroupId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [standardHours, setStandardHours] = useState('')
  const [rate, setRate] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    setError(null)
    const cleanName = name.trim()
    if (!cleanName || !groupId || !categoryId || !rate) {
      setError("Please fill in all required fields (Name, Group, Category, Rate).")
      return
    }

    setIsSubmitting(true)
    
    // Check duplicate
    const { data: existing, error: checkError } = await supabase
      .from('labor_services')
      .select('id')
      .ilike('name', cleanName)
      .maybeSingle()

    if (checkError) {
      setError(checkError.message)
      setIsSubmitting(false)
      return
    }
    
    if (existing) {
      setError("A labor service with this name already exists. Please select it from the dropdown.")
      setIsSubmitting(false)
      return
    }

    const stdHrsNum = standardHours ? parseFloat(standardHours) : null
    const rateNum = parseFloat(rate)

    const { data: newService, error: insertError } = await supabase
      .from('labor_services')
      .insert({
        name: cleanName,
        group_id: groupId,
        category_id: categoryId,
        standard_hours: stdHrsNum,
        rate: rateNum,
        notes: notes.trim() || null,
        is_active: isActive
      })
      .select(`
        *,
        labor_groups (*),
        labor_categories (*)
      `)
      .single()

    setIsSubmitting(false)

    if (insertError) {
      setError(`Failed to save: ${insertError.message}`)
      return
    }

    if (newService) {
      onSuccess(newService)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Add New Labor / Service</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Labor / Service Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g. Drive Shaft Replacement"
                autoFocus
              />
            </div>

            {/* Reuses the exact Group/Category logic built previously */}
            <GroupCategorySelector
              selectedGroupId={groupId}
              setSelectedGroupId={setGroupId}
              selectedCategoryId={categoryId}
              setSelectedCategoryId={setCategoryId}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Standard Hour</label>
                <input 
                  type="number"
                  min="0"
                  step="0.1"
                  value={standardHours}
                  onChange={e => setStandardHours(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 2.0"
                />
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
                    className="w-full border border-slate-300 rounded p-2 pl-8 focus:outline-none focus:border-blue-500 font-medium"
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
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 min-h-[80px]"
                placeholder="Optional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={e => setIsActive(e.target.value === 'active')}
                className="w-full md:w-1/3 border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSubmitting} 
            className="px-6 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Labor'}
          </button>
        </div>
      </div>
    </div>
  )
}
