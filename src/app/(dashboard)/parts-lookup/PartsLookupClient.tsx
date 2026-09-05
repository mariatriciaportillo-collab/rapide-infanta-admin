'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Search, Edit, Plus, Car, Loader2 } from 'lucide-react'
import { SearchableCombobox, ComboboxOption } from '@/components/ui/SearchableCombobox'
import { Pagination } from '@/components/ui/Pagination'

type Make = { id: string; name: string }
type Model = { id: string; make_id: string; name: string }

type UnifiedLookup = {
  id: string
  source: 'Manual Reference' | 'Previous Service'
  yearDisplay: string
  engine_capacity: string | null
  transmission: string | null
  category: string
  part_id: string | null
  part_name: string | null
  part_number: string | null
  brand: string | null
  notes: string | null
  raw_id?: string
}

type Props = {
  makes: Make[]
  models: Model[]
}

const PAGE_SIZE = 10

export function PartsLookupClient({ makes, models }: Props) {
  const supabase = createClient()

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedLookups, setPaginatedLookups] = useState<UnifiedLookup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  const fetchLookups = useCallback(async () => {
    // Only Make and Model are required
    const isVehicleModeValid = vehMakeId && vehModelId

    if (!isVehicleModeValid) {
      setPaginatedLookups([])
      setTotalCount(0)
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    const makeName = makes.find(m => m.id === vehMakeId)?.name
    const modelName = models.find(m => m.id === vehModelId)?.name

    try {
      // 1. Fetch Manual References
      let query1 = supabase
        .from('part_lookups')
        .select(`*, parts (id, name, part_number, brands (name))`)
        .eq('is_active', true)
        .eq('vehicle_make_id', vehMakeId)
        .eq('vehicle_model_id', vehModelId)

      const yearInt = parseInt(vehYear)
      if (!isNaN(yearInt)) {
        query1 = query1.lte('year_start', yearInt).gte('year_end', yearInt)
      }
      if (vehEngine) query1 = query1.ilike('engine_capacity', `%${vehEngine}%`)
      if (vehTransmission) query1 = query1.ilike('transmission', `%${vehTransmission}%`)

      // 2. Fetch Historical Services
      let query2 = supabase
        .from('quotations')
        .select(`
          id, vehicle_year, engine_capacity, transmission,
          quotation_items (
            id, item_type, part_id, description, part_number, category_name_snapshot,
            parts ( id, name, part_number, brands (name), part_categories (name) )
          )
        `)
        .eq('status', 'COMPLETED')
        .ilike('vehicle_make', makeName || '')
        .ilike('vehicle_model', modelName || '')

      if (!isNaN(yearInt)) query2 = query2.eq('vehicle_year', yearInt)
      if (vehEngine) query2 = query2.ilike('engine_capacity', `%${vehEngine}%`)
      if (vehTransmission) query2 = query2.ilike('transmission', `%${vehTransmission}%`)

      const [res1, res2] = await Promise.all([query1, query2])

      if (res1.error) {
        if (res1.error.code === 'PGRST205') {
          // Table missing, but we can still show history
        } else {
          console.error(res1.error)
        }
      }

      const unified: UnifiedLookup[] = []
      
      // Process Manual References
      if (res1.data) {
        res1.data.forEach((item: any) => {
          let y = item.year_start === item.year_end ? `${item.year_start}` : `${item.year_start}–${item.year_end}`
          unified.push({
            id: `manual_${item.id}`,
            raw_id: item.id,
            source: 'Manual Reference',
            yearDisplay: y,
            engine_capacity: item.engine_capacity,
            transmission: item.transmission,
            category: item.category,
            part_id: item.part_id,
            part_name: item.parts?.name || null,
            part_number: item.part_number || (item.parts ? item.parts.part_number : null),
            brand: item.brand || (item.parts?.brands ? item.parts.brands.name : null),
            notes: item.notes
          })
        })
      }

      // Process Historical Services
      if (res2.data) {
        res2.data.forEach((quote: any) => {
          if (!quote.quotation_items) return
          quote.quotation_items.forEach((qi: any) => {
            // Only Parts
            const isPrt = qi.item_type === 'PART' || qi.part_id
            if (!isPrt) return

            const category = qi.category_name_snapshot || qi.parts?.part_categories?.name || 'Uncategorized Part'
            const pnum = qi.part_number || qi.parts?.part_number || null
            const bname = qi.parts?.brands?.name || null

            unified.push({
              id: `hist_${qi.id}`,
              source: 'Previous Service',
              yearDisplay: quote.vehicle_year ? `${quote.vehicle_year}` : 'Unknown',
              engine_capacity: quote.engine_capacity,
              transmission: quote.transmission,
              category: category,
              part_id: qi.part_id,
              part_name: qi.parts?.name || qi.description,
              part_number: pnum,
              brand: bname,
              notes: null
            })
          })
        })
      }

      // Deduplicate
      const seen = new Set<string>()
      const finalArray: UnifiedLookup[] = []

      // Prioritize manual references, then historical
      unified.sort((a, b) => a.source === 'Manual Reference' ? -1 : 1)

      unified.forEach(item => {
        // Create a signature to identify duplicates
        const sig = `${item.yearDisplay}_${item.engine_capacity}_${item.transmission}_${item.category}_${item.part_id}_${item.part_number}`.toLowerCase()
        if (!seen.has(sig)) {
          seen.add(sig)
          finalArray.push(item)
        }
      })

      setTotalCount(finalArray.length)
      
      // Local Pagination
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE
      setPaginatedLookups(finalArray.slice(from, to))

    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, vehMakeId, vehModelId, vehYear, vehEngine, vehTransmission, page, makes, models])

  useEffect(() => {
    fetchLookups()
  }, [fetchLookups])

  useEffect(() => {
    setPage(1)
  }, [vehMakeId, vehModelId, vehYear, vehEngine, vehTransmission])

  const makeOptions: ComboboxOption[] = useMemo(() => 
    makes.map(m => ({ id: m.id, name: m.name })),
  [makes])

  const modelOptions: ComboboxOption[] = useMemo(() => 
    availableModelsForVeh.map(m => ({ id: m.id, name: m.name })),
  [availableModelsForVeh])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 flex items-center gap-2">
            <Car size={24} className="text-blue-600" />
            Parts Lookup
          </h1>
          <p className="text-slate-500 text-sm mt-1">Vehicle-specific parts reference database</p>
        </div>
        <div className="flex gap-3">
          <Link href="/parts-lookup/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-sm">
            <Plus size={18} /> Add Reference
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Make <span className="text-red-500">*</span></label>
              <SearchableCombobox 
                options={makeOptions}
                value={vehMakeId}
                onChange={(val) => {
                  setVehMakeId(val)
                  setVehModelId('')
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year <span className="font-normal lowercase">(Optional)</span></label>
              <input 
                type="number" 
                value={vehYear} 
                onChange={e => setVehYear(e.target.value)} 
                className="w-full border border-slate-300 rounded-md p-2 h-[38px] text-sm" 
                placeholder="All Years"
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

        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
              <p>Searching database...</p>
            </div>
          ) : (!vehMakeId || !vehModelId) ? (
            <div className="text-center p-12 text-slate-500">
              <Search size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-700">Select a Make and Model to view known part references.</p>
              <p className="text-sm mt-1">Filters like Year, Engine, and Transmission can be used to refine results.</p>
            </div>
          ) : paginatedLookups.length === 0 ? (
            <div className="text-center p-12 text-slate-500 bg-slate-50">
              <p className="text-lg font-medium text-slate-700">No matching part reference found.</p>
              <p className="text-sm mt-2">No verified parts or previous services match this vehicle.</p>
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
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Year</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Engine</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Trans</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Category</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Part Reference</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Brand</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold">Source</th>
                      <th className="px-4 py-3 px-4 uppercase tracking-wider font-semibold text-right w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedLookups.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 px-4 font-medium text-slate-700">{item.yearDisplay}</td>
                        <td className="px-4 py-3 px-4 text-slate-600">{item.engine_capacity || 'Any'}</td>
                        <td className="px-4 py-3 px-4 text-slate-600">{item.transmission || 'Any'}</td>
                        <td className="px-4 py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                        <td className="px-4 py-3 px-4">
                          {item.part_id ? (
                            <div>
                              <Link href={`/parts/${item.part_id}/edit`} className="text-blue-600 hover:underline font-medium block truncate max-w-[200px]" title={item.part_name || ''}>
                                {item.part_name}
                              </Link>
                              {item.part_number && <span className="text-xs text-slate-500">{item.part_number}</span>}
                            </div>
                          ) : (
                            <span className="font-medium text-slate-700">{item.part_number || item.part_name || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 px-4 text-slate-600">{item.brand || '—'}</td>
                        <td className="px-4 py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.source === 'Manual Reference' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 px-4 text-right">
                          <TableActions align="center">
                            {item.source === 'Manual Reference' && item.raw_id && (
                              <TableAction icon={Edit} label="Edit Manual Reference" href={`/parts-lookup/${item.raw_id}/edit`} />
                            )}
                          </TableActions>
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
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
