'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, ChevronDown, Check } from 'lucide-react'

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
}

export function PartSearchSelector({ selectedPartId, setSelectedPartId, onSelectPart, error }: Props) {
  const supabase = createClient()
  
  const [parts, setParts] = useState<Part[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`w-full border rounded-md p-2 bg-white flex justify-between items-center cursor-pointer ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedPart ? 'text-slate-900 font-medium' : 'text-slate-500'}>
          {selectedPart ? `${selectedPart.name} ${selectedPart.part_number ? `(${selectedPart.part_number})` : ''}` : 'Search part by name, SKU, or brand...'}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-80 flex flex-col">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              autoFocus
              className="w-full focus:outline-none text-sm" 
              placeholder="Type to filter..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto p-1 flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500">Loading parts...</div>
            ) : filteredParts.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No parts found matching "{search}"</div>
            ) : (
              filteredParts.map(part => (
                <div 
                  key={part.id}
                  className={`p-2 hover:bg-slate-50 rounded cursor-pointer flex justify-between items-center ${
                    selectedPartId === part.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedPartId(part.id)
                    onSelectPart?.(part)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  <div>
                    <div className="font-medium text-slate-900">{part.name}</div>
                    <div className="text-xs text-slate-500 flex gap-2">
                      {part.part_number && <span>Part No: {part.part_number}</span>}
                      {part.brands?.name && <span>Brand: {part.brands.name}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-700">{part.stock_quantity} {part.unit}</div>
                    {selectedPartId === part.id && <Check size={14} className="text-blue-600 inline-block mt-1" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
