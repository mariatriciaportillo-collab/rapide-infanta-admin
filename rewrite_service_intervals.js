const fs = require('fs')

const code = `'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react'
import { ENGINE_OIL_CLASSIFICATIONS } from '@/components/parts/EngineOilClassificationModal'

type IntervalItem = {
  id: string
  service_type: string
  classification: string | null
  months: number
  kilometers: number
}

export default function ServiceIntervalsPage() {
  const supabase = createClient()
  const [intervals, setIntervals] = useState<IntervalItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [serviceType, setServiceType] = useState('')
  const [classification, setClassification] = useState('')
  const [months, setMonths] = useState(3)
  const [kilometers, setKilometers] = useState(5000)
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIntervals()
  }, [])

  const fetchIntervals = async () => {
    setLoading(true)
    const { data } = await supabase.from('service_intervals').select('*').order('service_type').order('classification')
    if (data) setIntervals(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    const { error } = await supabase.from('service_intervals').delete().eq('id', id)
    if (error) {
      alert("Failed to delete: " + error.message)
      return
    }
    setIntervals(intervals.filter(i => i.id !== id))
  }

  const openAddModal = () => {
    setEditingId(null)
    setServiceType('')
    setClassification('')
    setMonths(3)
    setKilometers(5000)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: IntervalItem) => {
    setEditingId(item.id)
    setServiceType(item.service_type)
    setClassification(item.classification || '')
    setMonths(item.months)
    setKilometers(item.kilometers)
    setError(null)
    setIsModalOpen(true)
  }

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const type = serviceType.trim()
    if (!type) {
      setError("Service Type is required.")
      return
    }

    const isOilChange = type.toUpperCase().includes('OIL CHANGE') || type.toUpperCase().includes('ENGINE OIL')
    const finalClassification = isOilChange ? (classification || null) : null
    
    if (isOilChange && !finalClassification) {
      setError("Please select an Oil Classification for Engine Oil / Oil Change.")
      return
    }

    // Duplicate check
    const isDup = intervals.some(i => {
      if (editingId && i.id === editingId) return false
      const sameType = i.service_type.toUpperCase() === type.toUpperCase()
      const sameClass = (i.classification || '').toUpperCase() === (finalClassification || '').toUpperCase()
      return sameType && sameClass
    })

    if (isDup) {
      setError(\`Duplicate rule found for: \${type} - \${finalClassification || 'Default'}\`)
      return
    }

    setIsSaving(true)

    const payload = {
      service_type: type,
      classification: finalClassification,
      months: months,
      kilometers: kilometers,
      updated_at: new Date().toISOString()
    }

    if (editingId) {
      const { error } = await supabase.from('service_intervals').update(payload).eq('id', editingId)
      if (error) {
        setError("Failed to update: " + error.message)
        setIsSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('service_intervals').insert([payload])
      if (error) {
        setError("Failed to insert: " + error.message)
        setIsSaving(false)
        return
      }
    }

    await fetchIntervals()
    setIsSaving(false)
    setIsModalOpen(false)
  }

  const isModalOilChange = serviceType.toUpperCase().includes('OIL CHANGE') || serviceType.toUpperCase().includes('ENGINE OIL')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Service Interval Settings</h1>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
          <Plus size={20} /> Add Rule
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Interval Rules</h2>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr className="text-slate-600 text-sm border-b border-slate-200">
                <th className="pb-3 font-semibold">Service Type</th>
                <th className="pb-3 font-semibold">Classification / Oil Type</th>
                <th className="pb-3 font-semibold">Time Interval (Months)</th>
                <th className="pb-3 font-semibold">Mileage Interval (km)</th>
                <th className="pb-3 text-right font-semibold w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading settings...</td></tr>
              ) : intervals.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No interval rules set.</td></tr>
              ) : (
                intervals.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                    <td className="py-4 pr-4 font-medium text-slate-800">
                      {item.service_type}
                    </td>
                    <td className="py-4 pr-4 text-slate-600">
                      {item.classification || <span className="text-slate-400 italic">N/A</span>}
                    </td>
                    <td className="py-4 pr-4 text-slate-600">
                      {item.months}
                    </td>
                    <td className="py-4 pr-4 text-slate-600">
                      {item.kilometers.toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">
                {editingId ? 'Edit Service Interval' : 'Add Service Interval'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Type *</label>
                  <input 
                    type="text" 
                    required
                    value={serviceType} 
                    onChange={e => setServiceType(e.target.value)} 
                    className="w-full border border-slate-300 rounded-md p-2" 
                    placeholder="e.g. Oil Change"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Classification / Oil Type</label>
                  {isModalOilChange ? (
                    <select 
                      value={classification} 
                      onChange={e => setClassification(e.target.value)} 
                      className="w-full border border-slate-300 rounded-md p-2 bg-white"
                    >
                      <option value="">Select Oil Type...</option>
                      {ENGINE_OIL_CLASSIFICATIONS.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value="" 
                      disabled
                      className="w-full border border-slate-300 rounded-md p-2 text-slate-400 bg-slate-50 cursor-not-allowed" 
                      placeholder="N/A"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time Interval (Months) *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={months} 
                    onChange={e => setMonths(e.target.value ? parseInt(e.target.value) : 0)} 
                    className="w-full border border-slate-300 rounded-md p-2" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mileage Interval (km) *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={kilometers} 
                    onChange={e => setKilometers(e.target.value ? parseInt(e.target.value) : 0)} 
                    className="w-full border border-slate-300 rounded-md p-2" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2">
                  <Save size={18} />
                  {isSaving ? 'Saving...' : (editingId ? 'Save Changes' : 'Save Rule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
`

fs.writeFileSync('src/app/(dashboard)/admin/service-intervals/page.tsx', code)
console.log('Rewrote service intervals page.tsx')
