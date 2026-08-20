'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, ChevronDown, Check, Plus } from 'lucide-react'
import { AddPartModal } from './AddPartModal'

type Part = {
  id: string
  name: string
  part_number: string | null
  stock_quantity: number
  unit: string
  cost: number
  brands: any
}

type Props = {
  selectedPartId: string
  setSelectedPartId: (val: string) => void
  onSelectPart?: (part: Part | null) => void
  error?: boolean
  disabled?: boolean
}

export function PartSearchSelector({ selectedPartId, setSelectedPartId, onSelectPart, error, disabled }: Props) {
  const supabase = createClient()
  
  const [parts, setParts] = useState<Part[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchParts()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchParts = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('parts')
      .select('id, name, part_number, stock_quantity, unit, cost, brands(name)')
      .eq('is_active', true)
      .order('name')
    
    if (data) setParts(data)
    setIsLoading(false)
  }

  const filteredParts = parts.filter(p => {
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.part_number && p.part_number.toLowerCase().includes(q)) ||
      (p.brands?.name && p.brands.name.toLowerCase().includes(q))
    )
  })

  const selectedPart = parts.find(p => p.id === selectedPartId)

  const handlePartCreated = async (newPartId: string) => {
    setShowAddModal(false)
    await fetchParts()
    
    // Auto select the new part
    setSelectedPartId(newPartId)
    const { data } = await supabase
      .from('parts')
      .select('id, name, part_number, stock_quantity, unit, cost, brands(name)')
      .eq('id', newPartId)
      .single()
      
    if (data && onSelectPart) {
      onSelectPart(data)
    }
    setIsOpen(false)
    setSearch('')
  }

  return (
    <>
      <div className="relative w-full" ref={wrapperRef}>
        <div 
          className={`w-full border rounded-md p-2 bg-white flex justify-between items-center transition ${
            disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer hover:border-slate-400'
          } ${
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`truncate ${selectedPart ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
            {selectedPart ? `${selectedPart.name} ${selectedPart.part_number ? `(${selectedPart.part_number})` : ''}` : 'Search part by name, SKU, or brand...'}
          </span>
          <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-300 rounded-md shadow-xl flex flex-col" style={{ maxHeight: '320px' }}>
            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50 shrink-0 rounded-t-md">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                autoFocus
                className="w-full focus:outline-none text-sm bg-transparent" 
                placeholder="Type to filter products..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div className="overflow-y-auto p-1 flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-slate-500">Loading parts...</div>
              ) : filteredParts.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-500 mb-3">No matching products found.</p>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      setShowAddModal(true)
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium text-sm transition"
                  >
                    <Plus size={16} /> Create New Product
                  </button>
                </div>
              ) : (
                <>
                  {filteredParts.map(part => (
                    <div 
                      key={part.id}
                      className={`p-2 hover:bg-blue-50 rounded cursor-pointer flex justify-between items-center transition ${
                        selectedPartId === part.id ? 'bg-blue-100/50' : ''
                      }`}
                      onClick={() => {
                        setSelectedPartId(part.id)
                        onSelectPart?.(part)
                        setIsOpen(false)
                        setSearch('')
                      }}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-slate-900 truncate">{part.name}</div>
                        <div className="text-xs text-slate-500 flex gap-2 truncate">
                          {part.part_number && <span>{part.part_number}</span>}
                          {part.brands?.name && <span>• {part.brands.name}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500">Stock</div>
                        <div className={`text-sm font-semibold ${part.stock_quantity > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                          {part.stock_quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        setShowAddModal(true)
                      }}
                      className="w-full text-left px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium flex items-center gap-2 transition"
                    >
                      <Plus size={16} /> Add New Product
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPartModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={handlePartCreated} 
        />
      )}
    </>
  )
}
