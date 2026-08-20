'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Edit, Package } from 'lucide-react'

export default function PartsListPage() {
  const supabase = createClient()
  
  const [parts, setParts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')

  useEffect(() => {
    fetchParts()
  }, [])

  const fetchParts = async () => {
    setIsLoading(true)
    let query = supabase
      .from('parts')
      .select('*, brands(name), part_groups(name), part_categories(name)')
      .order('name')
      
    const { data } = await query
    if (data) setParts(data)
    setIsLoading(false)
  }

  const filteredParts = parts.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      p.name.toLowerCase().includes(q) || 
      (p.part_number && p.part_number.toLowerCase().includes(q)) ||
      (p.brands?.name && p.brands.name.toLowerCase().includes(q)) ||
      (p.part_groups?.name && p.part_groups.name.toLowerCase().includes(q)) ||
      (p.part_categories?.name && p.part_categories.name.toLowerCase().includes(q))
      
    const matchesStatus = filterActive === 'all' ? true : 
                          filterActive === 'active' ? p.is_active : 
                          !p.is_active

    return matchesSearch && matchesStatus
  })

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Parts & Materials</h1>
          <p className="text-slate-500 mt-1">Manage product inventory, pricing, and references</p>
        </div>
        <Link 
          href="/parts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Part
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
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
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Package className="animate-pulse text-slate-300" size={32} /></div>
                    Loading parts...
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Package className="text-slate-300" size={32} /></div>
                    No parts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => (
                  <tr key={part.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{part.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{part.part_number || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{part.brands?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div className="font-medium text-slate-800">{part.part_groups?.name}</div>
                      <div className="text-slate-500">{part.part_categories?.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">₱{Number(part.cost || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-blue-700">₱{Number(part.selling_price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        Number(part.stock_quantity) <= Number(part.reorder_level || 0) 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {part.stock_quantity} {part.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        part.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {part.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/parts/${part.id}/edit`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
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
      </div>
    </div>
  )
}
