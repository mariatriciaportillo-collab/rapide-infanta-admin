'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Save, Plus, X } from 'lucide-react'
import { SearchableCombobox } from '@/components/ui/SearchableCombobox'

export default function NewPartLaborRulePage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillPartId = searchParams.get('part_id')

  const [ruleName, setRuleName] = useState('')
  const [ruleType, setRuleType] = useState('SINGLE')
  const [laborId, setLaborId] = useState('')
  const [active, setActive] = useState(true)
  const [notes, setNotes] = useState('')
  const [selectedParts, setSelectedParts] = useState<any[]>([])

  const [availableParts, setAvailableParts] = useState<any[]>([])
  const [availableLabor, setAvailableLabor] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      // Load parts eligible for auto-suggest
      const { data: pData } = await supabase.from('parts').select('id, name, part_number').eq('is_active', true).eq('auto_suggest_labor', true).order('name')
      if (pData) setAvailableParts(pData)

      // Load labor from labor_services
      const { data: lData } = await supabase.from('labor_services').select('id, name').eq('is_active', true).order('name')
      if (lData) setAvailableLabor(lData)

      if (prefillPartId && pData) {
        const part = pData.find(p => p.id === prefillPartId)
        if (part) {
          setSelectedParts([part])
          setRuleName(`${part.name} Auto-Labor`)
        }
      }
    }
    loadData()
  }, [])

  const handleAddPart = (partId: string) => {
    if (!partId) return
    const part = availableParts.find(p => p.id === partId)
    if (part && !selectedParts.some(p => p.id === partId)) {
      const newParts = [...selectedParts, part]
      setSelectedParts(newParts)
      if (newParts.length > 1) setRuleType('COMBINATION')
    }
  }

  const handleRemovePart = (partId: string) => {
    const newParts = selectedParts.filter(p => p.id !== partId)
    setSelectedParts(newParts)
    if (newParts.length <= 1) setRuleType('SINGLE')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedParts.length === 0) return alert('Please select at least one trigger part.')
    if (!laborId) return alert('Please select a suggested labor service.')

    setIsSubmitting(true)
    try {
      const { data: rule, error: rErr } = await supabase.from('part_labor_rules').insert({
        rule_name: ruleName,
        rule_type: ruleType,
        labor_id: laborId,
        active,
        notes
      }).select('id').single()

      if (rErr) throw rErr

      const triggers = selectedParts.map(p => ({ rule_id: rule.id, part_id: p.id }))
      const { error: tErr } = await supabase.from('part_labor_rule_triggers').insert(triggers)
      
      if (tErr) throw tErr

      router.push('/part-labor-rules')
    } catch (err: any) {
      alert(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">New Part-to-Labor Rule</h1>
        <p className="text-slate-500">Create a new automation rule for repair parts.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">Rule Details</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name *</label>
              <input 
                required 
                type="text" 
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 font-medium" 
                placeholder="e.g. Rack End Replacement Rule"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Type</label>
                <div className="px-3 py-2 border border-slate-200 rounded-md bg-slate-50 font-medium text-slate-600">
                  {ruleType}
                </div>
                <p className="text-xs text-slate-500 mt-1">Automatically switches to COMBINATION if multiple parts are added.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={active ? 'active' : 'inactive'}
                  onChange={e => setActive(e.target.value === 'active')}
                  className="w-full border border-slate-300 rounded-md p-2 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Trigger Parts *</h3>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <select 
                className="flex-1 border border-slate-300 rounded-md p-2"
                onChange={(e) => {
                  handleAddPart(e.target.value)
                  e.target.value = "" // reset
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Select a Part to Add --</option>
                {availableParts.filter(p => !selectedParts.some(sp => sp.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.part_number ? `(${p.part_number})` : ''}</option>
                ))}
              </select>
            </div>

            {selectedParts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedParts.map(p => (
                  <div key={p.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    {p.name}
                    <button type="button" onClick={() => handleRemovePart(p.id)} className="text-blue-400 hover:text-blue-800">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No parts added. Select from the dropdown above.</p>
            )}
            <p className="text-xs text-slate-500 mt-4">
              If multiple parts are added, this becomes a Combination Rule. The suggested labor will only trigger if ALL these parts are selected in the quotation.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-800">Suggested Labor *</h3>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Labor Service</label>
            <SearchableCombobox 
              options={availableLabor.map(l => ({ id: l.id, name: l.name }))}
              value={laborId}
              onChange={setLaborId}
              placeholder="Search existing labor services..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Note: The system will automatically add this labor with ₱0.00. The staff must manually enter the labor price during quotation.
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-visible mb-8">
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-md p-2" 
              placeholder="Optional notes..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/part-labor-rules"
            className="px-6 py-2 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting || selectedParts.length === 0 || !laborId}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-md font-medium transition flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
      </form>
    </div>
  )
}
