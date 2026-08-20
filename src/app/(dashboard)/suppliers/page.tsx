'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Edit, Truck } from 'lucide-react'

export default function SuppliersListPage() {
  const supabase = createClient()
  
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setIsLoading(true)
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('name')
      
    const { data } = await query
    if (data) setSuppliers(data)
    setIsLoading(false)
  }

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      s.name.toLowerCase().includes(q) || 
      (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
      (s.mobile && s.mobile.toLowerCase().includes(q)) ||
      (s.telephone && s.telephone.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
      
    const matchesStatus = filterActive === 'all' ? true : 
                          filterActive === 'active' ? s.is_active : 
                          !s.is_active

    return matchesSearch && matchesStatus
  })

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage vendor accounts for parts and materials</p>
        </div>
        <Link 
          href="/suppliers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Supplier
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
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
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Truck className="animate-pulse text-slate-300" size={32} /></div>
                    Loading suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Truck className="text-slate-300" size={32} /></div>
                    No suppliers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                    <td className="px-6 py-4 text-slate-600">{supplier.contact_person || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div>{supplier.mobile || supplier.telephone || '—'}</div>
                      <div className="text-slate-500">{supplier.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{supplier.payment_terms || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/suppliers/${supplier.id}/edit`}
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
