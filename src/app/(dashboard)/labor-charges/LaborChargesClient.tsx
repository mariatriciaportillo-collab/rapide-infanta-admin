'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Search, Edit, Info, AlertCircle, Wrench, Loader2 } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

type Group = { id: string; name: string }
type Category = { id: string; group_id: string; name: string }
type Service = {
  id: string
  name: string
  group_id: string | null
  category_id: string | null
  standard_hours: number | null
  rate: number | null
  notes: string | null
  is_active: boolean
  labor_groups?: Group
  labor_categories?: Category
}

type Props = {
  groups: Group[]
  categories: Category[]
}

const PAGE_SIZE = 10

export function LaborChargesClient({ groups, categories }: Props) {
  const supabase = createClient()
  
  const [quickSearch, setQuickSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [paginatedServices, setPaginatedServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter categories based on selected group
  const availableCategories = useMemo(() => {
    if (!selectedGroup) return categories
    return categories.filter(c => c.group_id === selectedGroup)
  }, [categories, selectedGroup])

  const fetchServices = useCallback(async () => {
    setIsLoading(true)

    let query = supabase
      .from('labor_services')
      .select(`
        *,
        labor_groups (*),
        labor_categories (*)
      `, { count: 'exact' })

    // Apply Filters
    if (selectedGroup) {
      query = query.eq('group_id', selectedGroup)
    }
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }
    
    // Apply Search
    if (quickSearch.trim()) {
      const q = quickSearch.trim()
      // PostgREST doesn't directly support ilike on nested objects cleanly in a single OR across joined tables without embedded filtering.
      // So we will do a targeted search. If we need to search group/category name, it's better to fetch their IDs first or just rely on the main name.
      // We will search 'name' since group/category are filtered via dropdowns anyway.
      query = query.ilike('name', `%${q}%`)
    }

    // Apply Sorting
    query = query.order('name', { ascending: true })

    // Apply Pagination
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (!error && data) {
      setPaginatedServices(data as Service[])
      setTotalCount(count || 0)
    } else {
      console.error("Failed to fetch labor services:", error)
      setPaginatedServices([])
      setTotalCount(0)
    }
    setIsLoading(false)
  }, [supabase, selectedGroup, selectedCategory, quickSearch, page])

  useEffect(() => {
    // Debounce the search input by a small amount to prevent rapid DB queries on every keystroke
    const timer = setTimeout(() => {
      fetchServices()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchServices])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1)
  }, [quickSearch, selectedGroup, selectedCategory])

  const formatCurrency = (val: number | null | undefined): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-slate-400">—</span>
    return `₱${val.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* FILTER SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 pl-9 focus:outline-none focus:border-blue-500"
                placeholder="Search labor/services..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Group Filter</label>
            <select 
              value={selectedGroup}
              onChange={e => { setSelectedGroup(e.target.value); setSelectedCategory('') }}
              className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Groups</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category Filter</label>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              disabled={!selectedGroup && categories.length > 0 === false}
            >
              <option value="">All Categories</option>
              {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SERVICES TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0 rounded-t-lg">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Wrench size={18} className="text-slate-500"/>
            Labor & Services Master
          </h3>
        </div>
        
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="flex flex-col items-center text-slate-500 gap-2">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="font-medium">Loading labor charges...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 py-3 font-semibold">Labor / Service</th>
                    <th className="px-4 py-3 py-3 font-semibold">Group</th>
                    <th className="px-4 py-3 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 py-3 text-right font-semibold">Std. Hrs</th>
                    <th className="px-4 py-3 py-3 text-right font-semibold">Rate</th>
                    <th className="px-4 py-3 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                        No services found matching your criteria.<br/>
                      </td>
                    </tr>
                  ) : (
                    paginatedServices.map(service => (
                      <tr key={service.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{service.name}</div>
                          {service.notes && (
                            <div className="text-xs text-slate-400 mt-1 flex items-start gap-1 max-w-xs">
                              <Info size={12} className="mt-0.5 shrink-0" />
                              <span className="truncate">{service.notes}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {service.labor_groups?.name || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {service.labor_categories?.name || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {service.standard_hours ? service.standard_hours.toFixed(1) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(service.rate)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${service.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link 
                            href={`/labor-charges/${service.id}/edit`} 
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded inline-flex transition"
                            title="Edit Labor"
                          >
                            <Edit size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalCount > 0 && (
              <Pagination
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                currentPage={page}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
