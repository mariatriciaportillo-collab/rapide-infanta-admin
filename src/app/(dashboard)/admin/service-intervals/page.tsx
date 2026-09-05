'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, Plus, Trash2, Edit2 } from 'lucide-react'

export default function ServiceIntervalsPage() {
  const supabase = createClient()
  const [intervals, setIntervals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    fetchIntervals()
  }, [])

  const fetchIntervals = async () => {
    setLoading(true)
    const { data } = await supabase.from('service_intervals').select('*').order('service_type').order('classification')
    if (data) setIntervals(data)
    setLoading(false)
  }

  const handleUpdate = (index: number, field: string, value: string) => {
    const updated = [...intervals]
    if (field === 'months' || field === 'kilometers') {
      updated[index][field] = value ? parseInt(value) : 0
    } else {
      updated[index][field] = value
    }
    setIntervals(updated)
  }

  const handleAddRow = () => {
    setIntervals([...intervals, { service_type: 'Oil Change', classification: 'New Classification', months: 3, kilometers: 5000, isNew: true }])
  }
  
  const handleRemove = async (index: number) => {
    const item = intervals[index]
    if (!item.isNew && item.id) {
      await supabase.from('service_intervals').delete().eq('id', item.id)
    }
    setIntervals(intervals.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    for (const item of intervals) {
      if (item.id && !item.isNew) {
        await supabase.from('service_intervals').update({
          service_type: item.service_type,
          classification: item.classification,
          months: item.months,
          kilometers: item.kilometers
        }).eq('id', item.id)
      } else {
        await supabase.from('service_intervals').insert([{
          service_type: item.service_type,
          classification: item.classification,
          months: item.months,
          kilometers: item.kilometers
        }])
      }
    }
    await fetchIntervals()
    setSaving(false)
    alert("Saved successfully.")
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Service Interval Settings</h1>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50">
          <Save size={20} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Interval Rules</h2>
          <button onClick={handleAddRow} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <Plus size={16} /> Add Rule
          </button>
        </div>
        
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-600 text-sm border-b border-slate-200">
                <th className="pb-3 font-medium">Service Type</th>
                <th className="pb-3 font-medium">Classification / Oil Type</th>
                <th className="pb-3 font-medium">Time Interval (Months)</th>
                <th className="pb-3 font-medium">Mileage Interval (km)</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading settings...</td></tr>
              ) : intervals.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No interval rules set.</td></tr>
              ) : (
                intervals.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <input type="text" value={item.service_type} onChange={e => handleUpdate(idx, 'service_type', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm" />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="text" value={item.classification} onChange={e => handleUpdate(idx, 'classification', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm" />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="number" value={item.months} onChange={e => handleUpdate(idx, 'months', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm" />
                    </td>
                    <td className="py-3 pr-4">
                      <input type="number" step="1000" value={item.kilometers} onChange={e => handleUpdate(idx, 'kilometers', e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm" />
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleRemove(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                        <Trash2 size={18} />
                      </button>
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
