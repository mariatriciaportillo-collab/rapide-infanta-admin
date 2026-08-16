'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChevronDown, Plus, X } from 'lucide-react'

type VehicleMake = { id: string; name: string }
type VehicleModel = { id: string; make_id: string; name: string }

type Props = {
  selectedMake: string
  setSelectedMake: (val: string) => void
  selectedModel: string
  setSelectedModel: (val: string) => void
  disabled?: boolean
}

export function MakeModelSelector({ selectedMake, setSelectedMake, selectedModel, setSelectedModel, disabled }: Props) {
  const supabase = createClient()
  
  // Data
  const [makes, setMakes] = useState<VehicleMake[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  
  // UI State - Make
  const [makeSearch, setMakeSearch] = useState('')
  const [isMakeOpen, setIsMakeOpen] = useState(false)
  const makeRef = useRef<HTMLDivElement>(null)
  
  // UI State - Model
  const [modelSearch, setModelSearch] = useState('')
  const [isModelOpen, setIsModelOpen] = useState(false)
  const modelRef = useRef<HTMLDivElement>(null)
  
  // Modal State
  const [isMakeModalOpen, setIsMakeModalOpen] = useState(false)
  const [newMakeName, setNewMakeName] = useState('')
  const [isModelModalOpen, setIsModelModalOpen] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch initial Makes
  useEffect(() => {
    fetchMakes()
  }, [])

  // Fetch Models when Make changes
  useEffect(() => {
    if (selectedMake) {
      const activeMake = makes.find(m => m.name.toLowerCase() === selectedMake.toLowerCase())
      if (activeMake) {
        fetchModels(activeMake.id)
      } else {
        setModels([])
      }
    } else {
      setModels([])
    }
  }, [selectedMake, makes])

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (makeRef.current && !makeRef.current.contains(event.target as Node)) setIsMakeOpen(false)
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) setIsModelOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchMakes = async () => {
    const { data } = await supabase.from('vehicle_makes').select('*').order('name')
    if (data) setMakes(data)
  }

  const fetchModels = async (makeId: string) => {
    const { data } = await supabase.from('vehicle_models').select('*').eq('make_id', makeId).order('name')
    if (data) setModels(data)
  }

  const handleMakeSelect = (makeName: string) => {
    if (selectedMake !== makeName) {
      setSelectedMake(makeName)
      setSelectedModel('') // Reset model if make changes
      setModelSearch('')
    }
    setMakeSearch('')
    setIsMakeOpen(false)
  }

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
    setModelSearch('')
    setIsModelOpen(false)
  }

  const saveNewMake = async () => {
    setModalError(null)
    const clean = newMakeName.trim()
    if (!clean) return
    
    // Client-side duplicate check
    if (makes.some(m => m.name.toLowerCase() === clean.toLowerCase())) {
      setModalError('This Make already exists.')
      return
    }

    setIsSaving(true)
    const { data, error } = await supabase.from('vehicle_makes').insert({ name: clean }).select().single()
    setIsSaving(false)

    if (error) {
      if (error.code === '23505') setModalError('This Make already exists.')
      else setModalError(error.message)
      return
    }

    if (data) {
      setMakes([...makes, data].sort((a, b) => a.name.localeCompare(b.name)))
      handleMakeSelect(data.name)
      setIsMakeModalOpen(false)
      setNewMakeName('')
    }
  }

  const saveNewModel = async () => {
    setModalError(null)
    const clean = newModelName.trim()
    if (!clean) return
    
    const activeMake = makes.find(m => m.name.toLowerCase() === selectedMake.toLowerCase())
    if (!activeMake) {
      setModalError('Please select a valid Make first.')
      return
    }

    if (models.some(m => m.name.toLowerCase() === clean.toLowerCase())) {
      setModalError('This Model already exists for this Make.')
      return
    }

    setIsSaving(true)
    const { data, error } = await supabase.from('vehicle_models').insert({ 
      make_id: activeMake.id, 
      name: clean 
    }).select().single()
    setIsSaving(false)

    if (error) {
      if (error.code === '23505') setModalError('This Model already exists for this Make.')
      else setModalError(error.message)
      return
    }

    if (data) {
      setModels([...models, data].sort((a, b) => a.name.localeCompare(b.name)))
      handleModelSelect(data.name)
      setIsModelModalOpen(false)
      setNewModelName('')
    }
  }

  const filteredMakes = makes.filter(m => m.name.toLowerCase().includes(makeSearch.toLowerCase()))
  const filteredModels = models.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()))

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* MAKE DROPDOWN */}
        <div className="relative" ref={makeRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
          <div 
            className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70 border-slate-200' : 'border-slate-300'}`}
            onClick={() => !disabled && setIsMakeOpen(!isMakeOpen)}
          >
            <span className={selectedMake ? 'text-slate-900 font-medium' : 'text-slate-400'}>
              {selectedMake || 'Type or select make...'}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </div>

          {isMakeOpen && !disabled && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
              <div className="p-2 border-b border-slate-100">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Type in make name"
                  value={makeSearch}
                  onChange={e => setMakeSearch(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 text-sm focus:outline-none focus:border-blue-500"
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredMakes.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500 text-center">No matching makes found.</div>
                ) : (
                  filteredMakes.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => handleMakeSelect(m.name)}
                      className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedMake === m.name ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                    >
                      {m.name}
                    </div>
                  ))
                )}
              </div>
              <div 
                className="p-2 bg-slate-100 border-t border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1 transition"
                onClick={() => { setIsMakeOpen(false); setIsMakeModalOpen(true); setModalError(null); setNewMakeName(makeSearch) }}
              >
                <Plus size={16} /> Add New Make
              </div>
            </div>
          )}
        </div>

        {/* MODEL DROPDOWN */}
        <div className="relative" ref={modelRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
          <div 
            className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer ${(!selectedMake || disabled) ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70 text-slate-400' : 'bg-white border-slate-300'}`}
            onClick={() => {
              if (!disabled && selectedMake) setIsModelOpen(!isModelOpen)
            }}
          >
            <span className={selectedModel ? 'text-slate-900 font-medium' : 'text-slate-400'}>
              {!selectedMake ? 'Select make first' : (selectedModel || `Type or select ${selectedMake} model...`)}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </div>

          {isModelOpen && selectedMake && !disabled && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
              <div className="p-2 border-b border-slate-100">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Type in model name"
                  value={modelSearch}
                  onChange={e => setModelSearch(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 text-sm focus:outline-none focus:border-blue-500"
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredModels.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500 text-center">No matching models found.</div>
                ) : (
                  filteredModels.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => handleModelSelect(m.name)}
                      className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedModel === m.name ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                    >
                      {m.name}
                    </div>
                  ))
                )}
              </div>
              <div 
                className="p-2 bg-slate-100 border-t border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1 transition"
                onClick={() => { setIsModelOpen(false); setIsModelModalOpen(true); setModalError(null); setNewModelName(modelSearch) }}
              >
                <Plus size={16} /> Add New Model
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAKE MODAL */}
      {isMakeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Add New Vehicle Make</h3>
              <button type="button" onClick={() => setIsMakeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              {modalError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{modalError}</div>}
              <label className="block text-sm font-medium text-slate-700 mb-1">Make Name *</label>
              <input 
                type="text" 
                value={newMakeName} 
                onChange={e => setNewMakeName(e.target.value)} 
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g. Mazda"
                autoFocus
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsMakeModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition">Cancel</button>
              <button type="button" onClick={saveNewMake} disabled={isSaving || !newMakeName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODEL MODAL */}
      {isModelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Add New Vehicle Model</h3>
              <button type="button" onClick={() => setIsModelModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              {modalError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{modalError}</div>}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
                <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded p-2 cursor-not-allowed">
                  {selectedMake}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model Name *</label>
                <input 
                  type="text" 
                  value={newModelName} 
                  onChange={e => setNewModelName(e.target.value)} 
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Hilux"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsModelModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition">Cancel</button>
              <button type="button" onClick={saveNewModel} disabled={isSaving || !newModelName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
