'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Filter, Edit, Package, Eye, X, Loader2 } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'
import { createPortal } from 'react-dom'

const PAGE_SIZE = 25

// Simple Modal for Items
function ItemsModal({ pkg, onClose }: { pkg: any, onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null


  const items = pkg.package_items || []
  
  const laborItems = items.filter((i: any) => i.item_type === 'LABOR')
  const partItems = items.filter((i: any) => i.item_type === 'PART')
  
  let regularValue = 0;
  let hasCategoryParts = false;
  items.forEach((item: any) => {
    if (item.item_type === 'PART' && item.is_category) {
      hasCategoryParts = true;
      return;
    }
    const isLabor = item.item_type === 'LABOR'
    const qty = Number(item.quantity) || 1
    const sellingPrice = isLabor ? Number(item.labor_services?.rate) || 0 : Number(item.parts?.selling_price) || 0
    regularValue += (sellingPrice * qty)
  })

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Items in {pkg.name}</h3>
            {pkg.package_code && <p className="text-sm text-slate-500 font-mono mt-0.5">{pkg.package_code}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-0 flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3 font-bold">Type</th>
                <th className="px-6 py-3 font-bold">Requirement</th>
                <th className="px-6 py-3 font-bold text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laborItems.map((item: any, i: number) => (
                <tr key={`labor-${i}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-indigo-600 font-bold">Labor</td>
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{item.labor_services?.name || 'Unknown Item'}</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-600 font-medium">{Number(item.quantity) || 1}</td>
                </tr>
              ))}
              
              {partItems.map((item: any, i: number) => (
                <tr key={`part-${i}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-bold">
                    {item.is_category ? (
                      <span className="text-amber-600">Part Category</span>
                    ) : (
                      <span className="text-emerald-600">Fixed Part</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">
                    {item.is_category ? item.part_categories?.name || 'Unknown Category' : item.parts?.name || 'Unknown Item'}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-slate-600 font-medium">{Number(item.quantity) || 1}</td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-1 items-end shrink-0">
          <div className="flex justify-between w-64 text-slate-600">
            <span>Regular Value:</span>
            <span className="font-medium flex items-center gap-2">
              ₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {hasCategoryParts && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1 rounded">+ Variable</span>}
            </span>
          </div>
          <div className="flex justify-between w-64 text-slate-900 font-bold text-lg border-t border-slate-200 pt-1 mt-1">
            <span>Package Price:</span>
            <span>₱{Number(pkg.package_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}


export default function PackagesListPage() {
  const supabase = createClient()
  
  const [packages, setPackages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null)

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPackages = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('packages')
      .select('*, package_items(item_type, is_category, quantity, labor_services(rate, name), parts(selling_price, name, part_number), part_categories(name))', { count: 'exact' })
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
                    <th className="px-6 py-3 font-medium">PACKAGE NAME</th>
                    <th className="px-6 py-3 font-medium">CATEGORY</th>
                    <th className="px-6 py-3 font-medium text-right">ITEMS</th>
                    <th className="px-6 py-3 font-medium text-right">REGULAR VALUE</th>
                    <th className="px-6 py-3 font-medium text-right">PACKAGE PRICE</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><Package className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No packages found.</p>
                      </td>
                    </tr>
                  ) : (
                    packages.map(pkg => {
                      const items = pkg.package_items || []
                      const numItems = items.length
                      

                      let regularValue = 0;
                      let hasCategoryParts = false;
                      items.forEach((item: any) => {
                        if (item.item_type === 'PART' && item.is_category) {
                          hasCategoryParts = true;
                          return;
                        }
                        const isLabor = item.item_type === 'LABOR'
                        const sellingPrice = isLabor ? Number(item.labor_services?.rate) || 0 : Number(item.parts?.selling_price) || 0
                        const qty = Number(item.quantity) || 1
                        regularValue += (sellingPrice * qty)
                      })
                      
                      const pkgPrice = Number(pkg.package_price) || 0


                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{pkg.name}</div>
                            {pkg.package_code && <div className="text-xs font-mono text-slate-500 mt-0.5">{pkg.package_code}</div>}
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{pkg.category || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              type="button"
                              onClick={(e) => { e.preventDefault(); setSelectedPkg(pkg); }}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1"
                            >
                              {numItems}
                            </button>
                          </td>

                          <td className="px-6 py-4 text-right text-slate-500 font-medium">
                            <div className="flex flex-col items-end">
                              <span>₱{regularValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              {hasCategoryParts && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded mt-0.5 border border-amber-100">+ Variable</span>}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right font-bold text-slate-800">
                            ₱{pkgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${
                              pkg.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {pkg.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Link 
                                href={`/packages/${pkg.id}`}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
                              >
                                <Eye size={16} /> View
                              </Link>
                              <Link 
                                href={`/packages/${pkg.id}/edit`}
                                className="text-sm font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 hover:bg-slate-100 px-3 py-1.5 rounded-md transition"
                              >
                                <Edit size={16} /> Edit
                              </Link>
                            </div>
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
      
      {selectedPkg && (
        <ItemsModal 
          pkg={selectedPkg} 
          onClose={() => setSelectedPkg(null)} 
        />
      )}
    </div>
  )
}
