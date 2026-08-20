'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus } from 'lucide-react'

type Brand = {
  id: string
  name: string
}

type Props = {
  selectedBrandId: string
  setSelectedBrandId: (val: string) => void
  disabled?: boolean
}

export function BrandSelector({ selectedBrandId, setSelectedBrandId, disabled }: Props) {
  const supabase = createClient()
  
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [isAddingBrand, setIsAddingBrand] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    if (data) setBrands(data)
    setIsLoading(false)
  }

  const handleAddBrand = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();

    setError(null)
    setExistingId(null)
    
    const cleanName = newBrandName.trim()
    if (!cleanName) {
      setError("Brand name is required.")
      return
    }

    setIsSubmitting(true)
    
    // Duplicate check
    const { data: existing } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', cleanName)
      .maybeSingle()

    if (existing) {
      setError(`This brand already exists.`)
      setExistingId(existing.id)
      setIsSubmitting(false)
      return
    }

    const { data: newBrand, error: insertError } = await supabase
      .from('brands')
      .insert({ name: cleanName })
      .select()
      .single()

    setIsSubmitting(false)

    if (insertError) {
      setError(`Failed to create brand: ${insertError.message}`)
      return
    }

    if (newBrand) {
      setBrands(prev => [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedBrandId(newBrand.id)
      setIsAddingBrand(false)
      setNewBrandName('')
    }
  }
  
  const handleSelectExisting = () => {
    if (existingId) {
      setSelectedBrandId(existingId)
      setIsAddingBrand(false)
      setNewBrandName('')
      setExistingId(null)
      setError(null)
    }
  }

  return (
    <>
      <div className="relative ">
        <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
        <select
          value={selectedBrandId}
          onChange={(e) => setSelectedBrandId(e.target.value)}
          disabled={disabled || isLoading}
          className="w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-50"
        >
          <option value="">Select Brand...</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        
        {!disabled && (
          <button
            type="button"
            onClick={() => {
              setIsAddingBrand(true)
              setError(null)
              setExistingId(null)
            }}
            className="mt-2 text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Add New Brand
          </button>
        )}
      </div>

      {isAddingBrand && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Add New Brand</h3>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm mb-4 border border-amber-200">
                  <span className="font-medium">{error}</span>
                  {existingId && (
                    <button 
                      type="button" 
                      onClick={handleSelectExisting}
                      className="ml-2 underline hover:text-amber-900 font-bold"
                    >
                      Use existing brand instead
                    </button>
                  )}
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBrandName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                  
                      handleAddBrand(e)
                    }
                  }}
                  onChange={(e) => {
                    setNewBrandName(e.target.value)
                    setError(null)
                    setExistingId(null)
                  }}
                  className="w-full border border-slate-300 rounded-md p-2"
                  placeholder="e.g. Toyota"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddingBrand(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddBrand}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
