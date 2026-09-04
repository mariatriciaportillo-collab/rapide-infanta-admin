'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Edit, Package, Loader2 } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 25

export default function PartsListPage() {
  const supabase = createClient()
  
  const [parts, setParts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchParts = useCallback(async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('parts')
      .select('*, brands(name), part_groups(name), part_categories(name)', { count: 'exact' })
      .order('name')
      
    // Apply Status Filter
    if (filterActive === 'active') {
      query = query.eq('is_active', true)
    } else if (filterActive === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim()
      let orParts = [
        `name.ilike.%${q}%`,
        `part_number.ilike.%${q}%`
      ]

      // Fetch matching related IDs to allow searching across relationships
      const [{ data: brands }, { data: groups }, { data: categories }] = await Promise.all([
        supabase.from('brands').select('id').ilike('name', `%${q}%`),
        supabase.from('part_groups').select('id').ilike('name', `%${q}%`),
        supabase.from('part_categories').select('id').ilike('name', `%${q}%`)
      ])

      if (brands && brands.length > 0) {
        orParts.push(`brand_id.in.(${brands.map(b => b.id).join(',')})`)
      }
      if (groups && groups.length > 0) {
        orParts.push(`group_id.in.(${groups.map(g => g.id).join(',')})`)
      }
      if (categories && categories.length > 0) {
        orParts.push(`category_id.in.(${categories.map(c => c.id).join(',')})`)
      }

      query = query.or(orParts.join(','))
    }

    // Apply Pagination Range
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)
      
    const { data, count, error } = await query
    
    if (!error && data) {
      setParts(data)
      setTotalCount(count || 0)
    } else {
      console.error("Failed to fetch parts:", error)
      setParts([])
      setTotalCount(0)
    }
    
    setIsLoading(false)
  }, [supabase, searchQuery, filterActive, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParts()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchParts])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterActive])

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Parts & Materials</h1>
          <p className="text-slate-500 mt-1">Manage product inventory, pricing, and references</p>
        </div>
        <Link 
          href="/parts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add Part
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0 rounded-t-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, part no, brand, category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select 
                value={filterActive}
                onChange={e => setFilterActive(e.target.value)}
                className="border border-slate-300 rounded-md py-2 pl-3 pr-8 bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="flex flex-col items-center text-slate-500 gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="font-medium">Loading parts & materials...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="px-6 py-3 font-medium">PART / PRODUCT</th>
                    <th className="px-6 py-3 font-medium">PART NO.</th>
                    <th className="px-6 py-3 font-medium">BRAND</th>
                    <th className="px-6 py-3 font-medium">GROUP / CATEGORY</th>
                    <th className="px-6 py-3 font-medium">COST</th>
                    <th className="px-6 py-3 font-medium">SELLING PRICE</th>
                    <th className="px-6 py-3 font-medium">STOCK</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><Package className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No parts found matching your criteria.</p>
                        {searchQuery && <p className="text-sm mt-1">Try adjusting your search filters.</p>}
                      </td>
                    </tr>
                  ) : (
                    parts.map(part => (
                      <tr key={part.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{part.name}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-sm font-medium">{part.part_number || '—'}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{part.brands?.name || '—'}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          <div className="font-bold text-slate-800">{part.part_groups?.name || '—'}</div>
                          <div className="text-slate-500">{part.part_categories?.name}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">₱{Number(part.cost || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 font-bold text-blue-700">₱{Number(part.selling_price).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                            Number(part.stock_quantity) <= Number(part.reorder_level || 0) 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {part.stock_quantity} {part.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                            part.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {part.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Edit} label="Edit Part" href={`/parts/${part.id}/edit`} />
                        </TableActions>
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
