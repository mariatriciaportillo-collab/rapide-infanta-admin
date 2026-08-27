'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Edit, Truck, Loader2 } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 25

export default function SuppliersListPage() {
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
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
      const orParts = [
        `name.ilike.%${q}%`,
        `contact_person.ilike.%${q}%`,
        `mobile.ilike.%${q}%`,
        `telephone.ilike.%${q}%`,
        `email.ilike.%${q}%`
      ]
      query = query.or(orParts.join(','))
    }

    // Apply Pagination Range
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)
      
    const { data, count, error } = await query
    
    if (!error && data) {
      setSuppliers(data)
      setTotalCount(count || 0)
    } else {
      console.error("Failed to fetch suppliers:", error)
      setSuppliers([])
      setTotalCount(0)
    }
    
    setIsLoading(false)
  }, [supabase, searchQuery, filterActive, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchSuppliers])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterActive])

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage vendor accounts for parts and materials</p>
        </div>
        <Link 
          href="/suppliers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add Supplier
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0 rounded-t-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, contact, phone, email..." 
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
              <span className="font-medium">Loading suppliers...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="px-6 py-3 font-medium">SUPPLIER NAME</th>
                    <th className="px-6 py-3 font-medium">CONTACT PERSON</th>
                    <th className="px-6 py-3 font-medium">PHONE / EMAIL</th>
                    <th className="px-6 py-3 font-medium">PAYMENT TERMS</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><Truck className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No suppliers found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    suppliers.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                        <td className="px-6 py-4 font-bold text-slate-900">{supplier.name}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{supplier.contact_person || '—'}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          <div className="font-medium text-slate-800">{supplier.mobile || supplier.telephone || '—'}</div>
                          <div className="text-slate-500">{supplier.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{supplier.payment_terms || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${
                            supplier.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {supplier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/suppliers/${supplier.id}/edit`}
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
                          >
                            <Edit size={16} /> Edit
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
