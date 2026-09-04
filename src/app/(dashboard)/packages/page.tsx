'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Edit, Package, Loader2 } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'
import { TableActions, TableAction } from '@/components/ui/TableActions'

const PAGE_SIZE = 25

export default function PackagesListPage() {
  const supabase = createClient()
  
  const [packages, setPackages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPackages = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('packages')
      .select('*', { count: 'exact' })
      .order('name')
      
    if (filterActive === 'active') query = query.eq('is_active', true)
    else if (filterActive === 'inactive') query = query.eq('is_active', false)

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      query = query.or(`name.ilike.%${q}%,package_code.ilike.%${q}%,category.ilike.%${q}%`)
    }

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    
    if (data) {
      setPackages(data)
      setTotalCount(count || 0)
    } else {
      console.error(error)
      setPackages([])
      setTotalCount(0)
    }
    setIsLoading(false)
  }, [supabase, searchQuery, filterActive, page])

  useEffect(() => {
    const timer = setTimeout(() => fetchPackages(), 300)
    return () => clearTimeout(timer)
  }, [fetchPackages])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterActive])

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Packages</h1>
          <p className="text-slate-500 mt-1">Manage bundled services and parts</p>
        </div>
        <Link 
          href="/packages/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Package
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0 rounded-t-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search packages by name, code, category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
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
        
        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="flex flex-col items-center text-slate-500 gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="font-medium">Loading packages...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="px-6 py-3 font-medium w-2/5">PACKAGE NAME</th>
                    <th className="px-6 py-3 font-medium w-1/5">CATEGORY</th>
                    <th className="px-6 py-3 font-medium text-right w-1/5">PACKAGE PRICE</th>
                    <th className="px-6 py-3 font-medium w-1/5">STATUS</th>
                    <th className="px-6 py-3 font-medium text-center w-16">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><Package className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No packages found.</p>
                      </td>
                    </tr>
                  ) : (
                    packages.map(pkg => {
                      const pkgPrice = pkg.package_price !== null && pkg.package_price !== undefined 
                        ? Number(pkg.package_price) 
                        : null;

                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">
                              <Link href={`/packages/${pkg.id}/edit`} className="hover:underline">
                                {pkg.name}
                              </Link>
                            </div>
                            {pkg.package_code && <div className="text-xs font-mono text-slate-500 mt-0.5">{pkg.package_code}</div>}
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {pkg.category || '—'}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">
                            {pkgPrice !== null ? `₱${pkgPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                              pkg.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <TableActions align="center">
                              <TableAction icon={Edit} label="Edit Package" href={`/packages/${pkg.id}/edit`} />
                            </TableActions>
                          </td>
                        </tr>
                      )
                    })
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
