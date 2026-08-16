'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChevronDown, Plus, X } from 'lucide-react'

export type LaborService = { id: string; name: string; category: string | null }

type Props = {
  selectedServiceId: string
  setSelectedServiceId: (val: string) => void
  disabled?: boolean
}

export function ServiceSelector({ selectedServiceId, setSelectedServiceId, disabled }: Props) {
  const supabase = createClient()
  
  // Data
  const [services, setServices] = useState<LaborService[]>([])
  
  // UI State
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServiceCategory, setNewServiceCategory] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch initial Services
  useEffect(() => {
    fetchServices()
  }, [])

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchServices = async () => {
    const { data } = await supabase.from('labor_services').select('*').eq('is_active', true).order('name')
    if (data) setServices(data)
  }

  const handleSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setSearch('')
    setIsOpen(false)
  }

  const saveNewService = async () => {
    setModalError(null)
    const cleanName = newServiceName.trim()
    if (!cleanName) return
    
    // Client-side duplicate check
    if (services.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) {
      setModalError('This Service already exists.')
      return
    }

    setIsSaving(true)
    const { data, error } = await supabase.from('labor_services').insert({ 
      name: cleanName,
      category: newServiceCategory.trim() || null
    }).select().single()
    
    setIsSaving(false)

    if (error) {
      if (error.code === '23505') setModalError('This Service already exists.')
      else setModalError(error.message)
      return
    }

    if (data) {
      setServices([...services, data].sort((a, b) => a.name.localeCompare(b.name)))
      handleSelect(data.id)
      setIsModalOpen(false)
      setNewServiceName('')
      setNewServiceCategory('')
    }
  }

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const selectedService = services.find(s => s.id === selectedServiceId)

  return (
    <>
      <div className="relative" ref={containerRef}>
        <label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
        <div 
          className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70 border-slate-200' : 'border-slate-300'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedService ? 'text-slate-900 font-medium' : 'text-slate-400'}>
            {selectedService?.name || 'Type or select a service...'}
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg flex flex-col">
            <div className="p-2 border-b border-slate-100">
              <input 
                type="text"
                autoFocus
                placeholder="Type in service name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm focus:outline-none focus:border-blue-500"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredServices.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">No matching services found.</div>
              ) : (
                filteredServices.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedServiceId === s.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                  >
                    <div>{s.name}</div>
                    {s.category && <div className="text-xs text-slate-400">{s.category}</div>}
                  </div>
                ))
              )}
            </div>
            <div 
              className="p-2 bg-slate-100 border-t border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1 transition"
              onClick={() => { setIsOpen(false); setIsModalOpen(true); setModalError(null); setNewServiceName(search) }}
            >
              <Plus size={16} /> Add New Service
            </div>
          </div>
        )}
      </div>

      {/* NEW SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Add New Service</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              {modalError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{modalError}</div>}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name *</label>
                <input 
                  type="text" 
                  value={newServiceName} 
                  onChange={e => setNewServiceName(e.target.value)} 
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Wheel Alignment"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category (Optional)</label>
                <input 
                  type="text" 
                  value={newServiceCategory} 
                  onChange={e => setNewServiceCategory(e.target.value)} 
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Maintenance, Repair..."
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition">Cancel</button>
              <button type="button" onClick={saveNewService} disabled={isSaving || !newServiceName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition">
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
