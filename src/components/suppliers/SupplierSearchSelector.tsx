'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, ChevronDown, Plus } from 'lucide-react'
import { SupplierModal } from './SupplierModal'

type Supplier = {
  id: string
  name: string
}

type Props = {
  selectedSupplierId: string
  setSelectedSupplierId: (val: string) => void
  onSelectSupplier?: (supplier: Supplier | null) => void
  error?: boolean
  disabled?: boolean
}

export function SupplierSearchSelector({ selectedSupplierId, setSelectedSupplierId, onSelectSupplier, error, disabled }: Props) {
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSuppliers()
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

  const fetchSuppliers = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    
    if (data) setSuppliers(data)
    setIsLoading(false)
  }

  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q)
  })

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId)

  const handleSupplierCreated = async (newSupplier: any) => {
    setShowAddModal(false)
    await fetchSuppliers()
    
    setSelectedSupplierId(newSupplier.id)
    if (onSelectSupplier) {
      onSelectSupplier(newSupplier)
    }
    setIsOpen(false)
    setSearch('')
  }

  return (
    <>
      <div className="relative w-full" ref={wrapperRef}>
        <div 
          className={`w-full h-[42px] px-3 border bg-white flex justify-between items-center transition ${
            isOpen ? 'rounded-t-md border-blue-500 ring-1 ring-blue-500 z-10 relative' : 'rounded-md ' + (error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300')
          } ${
            disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer hover:border-slate-400'
          }`}
          onClick={() => {
            if (!disabled && !isOpen) {
              setIsOpen(true)
              setSearch('')
            }
          }}
        >
          <div className="flex-1 overflow-hidden flex items-center gap-2 h-full">
            {isOpen ? (
              <>
                <Search size={16} className="text-blue-500 shrink-0" />
                <input
                  autoFocus
                  className="w-full h-full focus:outline-none text-sm bg-transparent text-slate-900 placeholder:text-slate-400"
                  placeholder="Search supplier..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </>
            ) : (
              <div className={`truncate text-sm ${selectedSupplier ? 'w-full text-slate-900 font-medium' : 'text-slate-500'}`}>
                {selectedSupplier ? selectedSupplier.name : 'Select Supplier...'}
              </div>
            )}
          </div>
          <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''} ml-2`} />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-[70] w-full bg-white border border-t-0 border-blue-500 rounded-b-md shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: '320px', marginTop: '-1px' }}>
            <div className="overflow-y-auto p-1 flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-slate-500">Loading suppliers...</div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-500 mb-3">No matching suppliers found.</p>
                  <button 
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsOpen(false)
                      setShowAddModal(true)
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium text-sm transition"
                  >
                    <Plus size={16} /> Add New Supplier
                  </button>
                </div>
              ) : (
                <>
                  {filteredSuppliers.map(supplier => (
                    <div 
                      key={supplier.id}
                      className={`p-2 hover:bg-blue-50 rounded cursor-pointer flex justify-between items-center transition ${
                        selectedSupplierId === supplier.id ? 'bg-blue-100/50' : ''
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedSupplierId(supplier.id)
                        onSelectSupplier?.(supplier)
                        setIsOpen(false)
                        setSearch('')
                      }}
                    >
                      <div className="font-medium text-slate-900 text-sm truncate">{supplier.name}</div>
                    </div>
                  ))}
                  
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button 
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsOpen(false)
                        setShowAddModal(true)
                      }}
                      className="w-full text-left px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium flex items-center gap-2 transition"
                    >
                      <Plus size={16} /> Add New Supplier
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <SupplierModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={handleSupplierCreated} 
        />
      )}
    </>
  )
}
