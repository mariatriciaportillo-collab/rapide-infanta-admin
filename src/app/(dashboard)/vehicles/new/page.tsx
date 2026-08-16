'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Search, User } from 'lucide-react'
import Link from 'next/link'

function NewVehicleForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedCustomerId = searchParams.get('customer_id')
  
  const supabase = createClient()
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(preSelectedCustomerId)
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('')
  
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [plate, setPlate] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [transmission, setTransmission] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load pre-selected customer if provided
  useEffect(() => {
    if (preSelectedCustomerId) {
      supabase.from('customers').select('name').eq('id', preSelectedCustomerId).single().then(({ data }) => {
        if (data) setSelectedCustomerName(data.name)
      })
    }
  }, [preSelectedCustomerId, supabase])

  // Search Customers
  useEffect(() => {
    const search = async () => {
      if (customerSearch.trim().length < 2) {
        setSearchResults([])
        return
      }
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${customerSearch}%,mobile.ilike.%${customerSearch}%`)
        .limit(5)
      setSearchResults(data || [])
    }
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [customerSearch, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!selectedCustomerId) {
      setError("Please select an owner for this vehicle.")
      setIsSubmitting(false)
      return
    }

    if (!plate.trim()) {
      setError("Plate Number is required.")
      setIsSubmitting(false)
      return
    }

    try {
      // Duplicate protection
      const { data: existing } = await supabase
        .from('vehicles')
        .select('id, customers(name)')
        .eq('plate_number', plate.toUpperCase().replace(/\s/g, '')) // basic normalization
        .maybeSingle()

      if (existing) {
        // We warn but in this simple flow we block it.
        // A real system might show a warning dialog. We'll throw an error.
        throw new Error(`A vehicle with this plate already exists under: ${(existing.customers as any)?.name}`)
      }

      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          customer_id: selectedCustomerId,
          plate_number: plate.toUpperCase(),
          make: make,
          model: model,
          year: year ? parseInt(year) : null,
          transmission: transmission,
          notes: notes
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/customers/${selectedCustomerId}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while saving.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="pb-24 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-bold text-slate-800">Add Vehicle</h2>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Save size={18} />
          {isSubmitting ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Owner (Customer or Company) *</label>
          
          {selectedCustomerId ? (
            <div className="flex justify-between items-center p-3 border border-slate-200 rounded-md bg-slate-50">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <User size={18} className="text-slate-500" />
                {selectedCustomerName}
              </div>
              <button type="button" onClick={() => setSelectedCustomerId(null)} className="text-sm text-red-500 hover:underline">
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, company, or mobile..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setShowDropdown(true)
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                  {searchResults.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(cust.id)
                        setSelectedCustomerName(cust.name)
                        setShowDropdown(false)
                        setCustomerSearch('')
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="font-medium text-slate-900">{cust.name}</div>
                      <div className="text-xs text-slate-500">{cust.customer_type} • {cust.mobile || 'No mobile'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number *</label>
            <input required type="text" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} className="w-full border border-slate-300 rounded-md p-2 uppercase" placeholder="ABC 1234" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
            <input type="text" value={make} onChange={e => setMake(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Toyota" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
            <input type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Hilux" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="2023" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
            <select value={transmission} onChange={e => setTransmission(e.target.value)} className="w-full border border-slate-300 rounded-md p-2">
              <option value="">Select...</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md p-2" placeholder="Any additional information..."></textarea>
          </div>
        </div>
      </div>
    </form>
  )
}

export default function NewVehiclePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <NewVehicleForm />
    </Suspense>
  )
}
