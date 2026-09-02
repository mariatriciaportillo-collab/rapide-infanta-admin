'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'

type Props = {
  makes: any[]
  models: any[]
  parts: any[]
  initialData?: any
}

export function PartsLookupForm({ makes, models, parts, initialData }: Props) {
  const supabase = createClient()
  const router = useRouter()
  
  const [makeId, setMakeId] = useState(initialData?.vehicle_make_id || '')
  const [modelId, setModelId] = useState(initialData?.vehicle_model_id || '')
  const [yearStart, setYearStart] = useState(initialData?.year_start?.toString() || '')
  const [yearEnd, setYearEnd] = useState(initialData?.year_end?.toString() || '')
  const [engine, setEngine] = useState(initialData?.engine_capacity || '')
  const [transmission, setTransmission] = useState(initialData?.transmission || '')
  
  const [category, setCategory] = useState(initialData?.category || '')
  const [partId, setPartId] = useState(initialData?.part_id || '')
  const [partNumber, setPartNumber] = useState(initialData?.part_number || '')
  const [brand, setBrand] = useState(initialData?.brand || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [isActive, setIsActive] = useState(initialData ? initialData.is_active : true)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const availableModels = useMemo(() => {
    if (!makeId) return []
    return models.filter(m => m.make_id === makeId)
  }, [models, makeId])

  const makeOptions = useMemo(() => makes.map(m => ({ id: m.id, name: m.name })), [makes])
  const modelOptions = useMemo(() => availableModels.map(m => ({ id: m.id, name: m.name })), [availableModels])
  const partOptions = useMemo(() => [
    { id: "", name: "— Custom / External Part —" },
    ...parts.map(p => ({ id: p.id, name: `${p.part_number} - ${p.name} (${(p.brands ? p.brands.name : null) || "No Brand"})` }))
  ], [parts])

  // Pre-fill brand/number if part is selected
  const handlePartSelect = (val: string) => {
    setPartId(val)
    if (val) {
      const p = parts.find(x => x.id === val)
      if (p) {
        setPartNumber(p.part_number || '')
        setBrand((p.brands ? p.brands.name : null) || '')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!makeId || !modelId || !yearStart || !yearEnd || !category) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const payload = {
      vehicle_make_id: makeId,
      vehicle_model_id: modelId,
      year_start: parseInt(yearStart),
      year_end: parseInt(yearEnd),
      engine_capacity: engine.trim() || null,
      transmission: transmission || null,
      category: category.trim(),
      part_id: partId || null,
      part_number: partNumber.trim() || null,
      brand: brand.trim() || null,
      notes: notes.trim() || null,
      is_active: isActive
    }

    let err
    try {
      if (initialData?.id) {
        const { error } = await supabase.from('part_lookups').update(payload).eq('id', initialData.id)
        err = error
      } else {
        const { error } = await supabase.from('part_lookups').insert([payload])
        err = error
      }

      if (err) {
        if (err.code === 'PGRST205') {
           throw new Error('Database table "part_lookups" does not exist yet. Please run migrations.')
        }
        throw err
      }

      router.push('/parts-lookup')
      router.refresh()
    } catch (error: any) {
      setErrorMsg(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/parts-lookup" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Parts Reference' : 'New Parts Reference'}
          </h2>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Save Reference
        </button>
      </div>

      {errorMsg && (
        <div className="m-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-3 border border-red-200">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="p-6 space-y-8">
        
        {/* Vehicle Details */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">Vehicle Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Make <span className="text-red-500">*</span></label>
              <SearchableCombobox 
                options={makeOptions}
                value={makeId}
                onChange={(val) => {
                  setMakeId(val)
                  setModelId('')
                }}
                placeholder="Select Make"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Model <span className="text-red-500">*</span></label>
              <SearchableCombobox 
                options={modelOptions}
                value={modelId}
                onChange={setModelId}
                placeholder="Select Model"
                
              />
            </div>
            <div className="space-y-1"></div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Year Start <span className="text-red-500">*</span></label>
              <input type="number" value={yearStart} onChange={e => {
                setYearStart(e.target.value)
                if (!yearEnd) setYearEnd(e.target.value)
              }} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. 2018" required />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Year End <span className="text-red-500">*</span></label>
              <input type="number" value={yearEnd} onChange={e => setYearEnd(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. 2022" required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Engine Capacity <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" value={engine} onChange={e => setEngine(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. 1.5L" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Transmission <span className="text-slate-400 font-normal">(Optional)</span></label>
              <select value={transmission} onChange={e => setTransmission(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm bg-white">
                <option value="">Any</option>
                <option value="AT">Automatic (AT)</option>
                <option value="MT">Manual (MT)</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
          </div>
        </section>

        {/* Part Details */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">Part Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. Oil Filter, Brake Pads" required list="category-suggestions" />
              <datalist id="category-suggestions">
                <option value="Oil Filter" />
                <option value="Air Filter" />
                <option value="Cabin Filter" />
                <option value="Fuel Filter" />
                <option value="Spark Plug" />
                <option value="ATF Fluid" />
                <option value="Brake Pads" />
                <option value="Brake Shoes" />
              </datalist>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">Link to Inventory Part <span className="text-slate-400 font-normal">(Optional)</span></label>
              <SearchableCombobox 
                options={partOptions}
                value={partId}
                onChange={handlePartSelect}
                placeholder="Search master parts list..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Part Number / Reference</label>
              <input type="text" value={partNumber} onChange={e => setPartNumber(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. MC-110" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Brand</label>
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. MAX POWER" />
            </div>

            <div className="space-y-1 lg:col-span-3">
              <label className="text-sm font-medium text-slate-700">Notes / Alternatives</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" placeholder="e.g. Also compatible with MA-1034" />
            </div>

            <div className="space-y-1 lg:col-span-3 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">Active Reference</span>
              </label>
              <p className="text-xs text-slate-500 ml-6">Uncheck this to disable an outdated or incorrect part reference without deleting it.</p>
            </div>
          </div>
        </section>
      </div>
    </form>
  )
}
