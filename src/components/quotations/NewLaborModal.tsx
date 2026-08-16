import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Save } from 'lucide-react'
import { GroupCategorySelector } from '@/components/labor/GroupCategorySelector'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newLabor: any) => void
  initialName?: string
}

export function NewLaborModal({ isOpen, onClose, onSuccess, initialName = '' }: Props) {
  const supabase = createClient()
  
  const [serviceName, setServiceName] = useState(initialName)
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  
  const [standardHours, setStandardHours] = useState('')
  const [rate, setRate] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when opened with new initialName
  React.useEffect(() => {
    if (isOpen) {
      setServiceName(initialName)
      setSelectedGroupId('')
      setSelectedCategoryId('')
      setStandardHours('')
      setRate('')
      setNotes('')
      setError(null)
    }
  }, [isOpen, initialName])

  if (!isOpen) return null

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

    const { data: newLabor, error: insertError } = await supabase.from('labor_services').insert({
      name: serviceName.trim(),
      group_id: selectedGroupId,
      category_id: selectedCategoryId,
      standard_hours: standardHours ? parseFloat(standardHours) : null,
      rate: parseFloat(rate),
      notes: notes.trim() || null,
      is_active: isActive
    }).select('*, labor_groups(*), labor_categories(*)').single()

    if (insertError) {
      if (insertError.code === '23505') {
        setError("A service with this name already exists.")
      } else {
        setError(`Failed to save: ${insertError.message}`)
      }
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    onSuccess(newLabor)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">Add New Labor / Service</h2>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Labor / Service *</label>
              <input 
                type="text"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g. Drive Shaft Replacement"
                autoFocus
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
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2 disabled:bg-blue-400"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save & Select'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
