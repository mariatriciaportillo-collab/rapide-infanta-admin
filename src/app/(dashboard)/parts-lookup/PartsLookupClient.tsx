'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Search, Edit, Plus, Car, Loader2 } from 'lucide-react'
import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'
import { Pagination } from '@/components/ui/Pagination'

// Types based on schema
type Make = { id: string; name: string }
type Model = { id: string; make_id: string; name: string }
type PartMaterial = { id: string; name: string; item_code: string; brand: string }

type PartsLookup = {
  id: string
  vehicle_make_id: string
  vehicle_model_id: string
  year_start: number
  year_end: number
  engine_capacity: string | null
  transmission: string | null
  category: string
  part_id: string | null
  part_number: string | null
  brand: string | null
  notes: string | null
  is_active: boolean
  vehicle_makes: Make
  vehicle_models: Model
  parts_materials?: PartMaterial
}

type Props = {
  makes: Make[]
  models: Model[]
}

const PAGE_SIZE = 25

export function PartsLookupClient({ makes, models }: Props) {
  const supabase = createClient()

  // === PAGINATION STATE ===
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedLookups, setPaginatedLookups] = useState<PartsLookup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // === SEARCH BY VEHICLE ===
  const [vehMakeId, setVehMakeId] = useState('')
  const [vehModelId, setVehModelId] = useState('')
  const [vehYear, setVehYear] = useState('')
  const [vehEngine, setVehEngine] = useState('')
  const [vehTransmission, setVehTransmission] = useState('')

  const availableModelsForVeh = useMemo(() => {
    if (!vehMakeId) return []
    return models.filter(m => m.make_id === vehMakeId)
  }, [models, vehMakeId])

  const selectedVehicleName = useMemo(() => {
    const make = makes.find(m => m.id === vehMakeId)?.name
    const model = models.find(m => m.id === vehModelId)?.name
    if (make && model) return `${make} ${model} ${vehYear}`.trim()
    return null
  }, [makes, models, vehMakeId, vehModelId, vehYear])

  // === DATA FETCHING ===
  const fetchLookups = useCallback(async () => {
    const isVehicleModeValid = vehMakeId && vehModelId && vehYear

    if (!isVehicleModeValid) {
      setPaginatedLookups([])
      setTotalCount(0)
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    // Check if table exists (graceful degradation if migration not applied)
    try {
      let query = supabase
        .from('part_lookups')
        .select(`
          *,
          vehicle_makes (*),
          vehicle_models (*),
          parts_materials (id, name, item_code, brand)
        `, { count: 'exact' })
        .eq('is_active', true)

      query = query.eq('vehicle_make_id', vehMakeId)
      query = query.eq('vehicle_model_id', vehModelId)
      
      const yearInt = parseInt(vehYear)
      if (!isNaN(yearInt)) {
        query = query.lte('year_start', yearInt)
        query = query.gte('year_end', yearInt)
      }
      
      if (vehEngine) {
        query = query.ilike('engine_capacity', `%${vehEngine}%`)
      }
      if (vehTransmission) {
        query = query.ilike('transmission', `%${vehTransmission}%`)
      }

      // Pagination
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data, count, error } = await query
      
      if (error) {
        if (error.code === 'PGRST205') {
          setErrorMsg('Parts Lookup table is not yet created. Please run the database migration.')
        } else {
          setErrorMsg(error.message)
        }
        setPaginatedLookups([])
        setTotalCount(0)
      } else {
        setPaginatedLookups(data as PartsLookup[])
        setTotalCount(count || 0)
      }
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, vehMakeId, vehModelId, vehYear, vehEngine, vehTransmission, page])

  useEffect(() => {
    fetchLookups()
  }, [fetchLookups])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [vehMakeId, vehModelId, vehYear, vehEngine, vehTransmission])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Options for comboboxes
  const makeOptions: ComboboxOption[] = useMemo(() => 
    makes.map(m => ({ id: m.id, name: m.name })),
  [makes])

  const modelOptions: ComboboxOption[] = useMemo(() => 
    availableModelsForVeh.map(m => ({ id: m.id, name: m.name })),
  [availableModelsForVeh])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Car size={24} className="text-blue-600" />
            Parts Lookup
          </h1>
          <p className="text-slate-500 text-sm mt-1">Vehicle-specific parts reference database</p>
        </div>
        <div className="flex gap-3">
          <Link href="/parts-lookup/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            <Plus size={18} /> Add Reference
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        
        {/* Filters Section */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Make <span className="text-red-500">*</span></label>
              <SearchableCombobox 
                options={makeOptions}
                value={vehMakeId}
                onChange={(val) => {
                  setVehMakeId(val)
                  setVehModelId('') // Reset model on make change
                }}
                placeholder="Select Make"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model <span className="text-red-500">*</span></label>
              <SearchableCombobox 
                options={modelOptions}
                value={vehModelId}
                onChange={setVehModelId}
                placeholder="Select Model"
                
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                value={vehYear} 
                onChange={e => setVehYear(e.target.value)} 
                className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" 
                placeholder="e.g. 2020"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine <span className="font-normal lowercase">(Optional)</span></label>
              <input 
                type="text" 
                value={vehEngine} 
                onChange={e => setVehEngine(e.target.value)} 
                className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" 
                placeholder="e.g. 1.3L"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transmission <span className="font-normal lowercase">(Optional)</span></label>
              <select 
                value={vehTransmission} 
                onChange={e => setVehTransmission(e.target.value)} 
                className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm bg-white" 
              >
                <option value="">Any</option>
                <option value="AT">Automatic</option>
                <option value="MT">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
              <p>Searching database...</p>
            </div>
          ) : (!vehMakeId || !vehModelId || !vehYear) ? (
            <div className="text-center p-12 text-slate-500">
              <Search size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-700">Enter Vehicle Details</p>
              <p className="text-sm">Please select a Make, Model, and Year to view compatible parts.</p>
            </div>
          ) : paginatedLookups.length === 0 ? (
            <div className="text-center p-12 text-slate-500 bg-slate-50">
              <p className="text-lg font-medium text-slate-700">No matching part reference found.</p>
              <p className="text-sm mt-2">No verified parts have been assigned to {selectedVehicleName} yet.</p>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-900">
                  Parts for {selectedVehicleName}
                  {vehEngine && ` (${vehEngine})`}
                </h3>
                <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  {totalCount} Results
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Part Category</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Part / Reference</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Brand</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Notes</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedLookups.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                        <td className="py-3 px-4">
                          {item.parts_materials ? (
                            <div>
                              <Link href={`/parts/${item.part_id}/edit`} className="text-blue-600 hover:underline font-medium block">
                                {item.parts_materials.name}
                              </Link>
                              <span className="text-xs text-slate-500">{item.parts_materials.item_code}</span>
                            </div>
                          ) : (
                            <span className="font-medium text-slate-700">{item.part_number}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.brand || (item.parts_materials ? item.parts_materials.brand : '—')}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{item.notes || '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/parts-lookup/${item.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                            <Edit size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200">
                <Pagination 
                  currentPage={page}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
