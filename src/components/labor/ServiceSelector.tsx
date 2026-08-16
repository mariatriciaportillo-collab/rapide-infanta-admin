'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ChevronDown, Plus, X } from 'lucide-react'
import { AddLaborModal } from './AddLaborModal'

export type LaborService = { 
  id: string
  name: string
  group_id: string | null
  category_id: string | null
  standard_hours: number | null
  rate: number | null
  labor_groups?: { name: string }
  labor_categories?: { name: string }
}

type Props = {
  selectedServiceId: string
  setSelectedServiceId: (val: string) => void
  disabled?: boolean
  onServiceSelect?: (service: LaborService) => void
}

export function ServiceSelector({ selectedServiceId, setSelectedServiceId, disabled, onServiceSelect }: Props) {
  const supabase = createClient()
  
  // Data
  const [services, setServices] = useState<LaborService[]>([])
  
  // UI State
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSearchQuery, setNewSearchQuery] = useState('')

  // Fetch initial Services
  useEffect(() => {
    fetchServices()
  }, [])

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchServices = async () => {
    const { data } = await supabase
      .from('labor_services')
      .select(`
        *,
        labor_groups(name),
        labor_categories(name)
      `)
      .eq('is_active', true)
      .order('name')
    if (data) setServices(data)
  }

  const handleSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setSearch('')
    setIsOpen(false)
    
    if (onServiceSelect) {
      const service = services.find(s => s.id === serviceId)
      if (service) onServiceSelect(service)
    }
  }

  const handleModalSuccess = (newService: LaborService) => {
    setServices([...services, newService].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedServiceId(newService.id)
    if (onServiceSelect) onServiceSelect(newService)
    setIsModalOpen(false)
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.labor_categories?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.labor_groups?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const selectedService = services.find(s => s.id === selectedServiceId)

  return (
    <>
      <div className="relative" ref={containerRef}>
        <label className="block text-sm font-medium text-slate-700 mb-1">Labor / Service *</label>
        <div 
          className={`w-full border rounded-md p-2 flex justify-between items-center cursor-pointer bg-white ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-70 border-slate-200' : 'border-slate-300'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedServiceId ? 'text-blue-700 font-medium' : 'text-slate-400'}>
            {selectedService ? selectedService.name : 'Search or choose service...'}
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
            <div className="max-h-64 overflow-y-auto">
              {filteredServices.length === 0 ? (
                <div className="p-3 text-sm text-slate-500 text-center">No matching services found.</div>
              ) : (
                filteredServices.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    className={`p-2 px-3 text-sm cursor-pointer hover:bg-blue-50 transition ${selectedServiceId === s.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex gap-2">
                      <span>{s.labor_groups?.name || 'No Group'}</span>
                      <span>&bull;</span>
                      <span>{s.labor_categories?.name || 'No Category'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div 
              className="p-2 bg-slate-100 border-t border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1 transition"
              onClick={() => { setIsOpen(false); setIsModalOpen(true); setNewSearchQuery(search) }}
            >
              <Plus size={16} /> Add New Labor
            </div>
          </div>
        )}
      </div>

      <AddLaborModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialName={newSearchQuery}
      />
    </>
  )
}
