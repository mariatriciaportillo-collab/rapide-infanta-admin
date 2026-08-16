'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Edit, Info, AlertCircle, Wrench } from 'lucide-react'

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
  services: Service[]
}

export function LaborChargesClient({ groups, categories, services }: Props) {
  const [quickSearch, setQuickSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Filter categories based on selected group
  const availableCategories = useMemo(() => {
    if (!selectedGroup) return categories
    return categories.filter(c => c.group_id === selectedGroup)
  }, [categories, selectedGroup])

  // Filter services for the table
  const filteredServices = useMemo(() => {
    let result = services

    // Filter by group
    if (selectedGroup) {
      result = result.filter(s => s.group_id === selectedGroup)
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(s => s.category_id === selectedCategory)
    }

    // Filter by search
    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.labor_groups?.name.toLowerCase().includes(q) ||
        s.labor_categories?.name.toLowerCase().includes(q)
      )
    }

    return result
  }, [services, quickSearch, selectedGroup, selectedCategory])

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-'
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
              className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Categories</option>
              {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* SERVICES TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Wrench size={18} className="text-slate-500"/>
            Labor & Services Master
          </h3>
          <div className="text-sm text-slate-500">
            {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Labor / Service</th>
                <th className="px-6 py-3">Group</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Std. Hrs</th>
                <th className="px-6 py-3 text-right">Rate</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                    No services found matching your criteria.<br/>
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => (
                  <tr key={service.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{service.name}</div>
                      {service.notes && (
                        <div className="text-xs text-slate-400 mt-1 flex items-start gap-1 max-w-xs">
                          <Info size={12} className="mt-0.5 shrink-0" />
                          <span className="truncate">{service.notes}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {service.labor_groups?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {service.labor_categories?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {service.standard_hours ? service.standard_hours.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      {formatCurrency(service.rate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
      </div>
    </div>
  )
}
