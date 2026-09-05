'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Search, Filter, Download, Printer, ClipboardList, CheckCircle2, AlertCircle, XCircle, Eye } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 25

export default function InventoryListPage() {
  const supabase = createClient()
  
  const [parts, setParts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchInventory = useCallback(async () => {
    setIsLoading(true)
    
    let query = supabase
      .from('parts')
      .select('*, brands(name), part_groups(name), part_categories(name)', { count: 'exact' })
      .order('name')
      
    // Apply Stock Filter
    if (stockFilter === 'out-of-stock') {
      query = query.lte('stock_quantity', 0)
    } else if (stockFilter === 'in-stock' || stockFilter === 'low-stock') {
      // Need to compare two columns which PostgREST doesn't support natively without RPC/Views.
      // We will fetch the subset of IDs that match the criteria.
      const { data: stockData } = await supabase.from('parts').select('id, stock_quantity, reorder_level')
      if (stockData) {
        const matchingIds = stockData.filter(p => {
          const stock = Number(p.stock_quantity) || 0
          const reorder = Number(p.reorder_level) || 0
          if (stockFilter === 'in-stock') return stock > reorder
          if (stockFilter === 'low-stock') return stock > 0 && stock <= reorder
          return false
        }).map(p => p.id)
        
        if (matchingIds.length > 0) {
          query = query.in('id', matchingIds)
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000') // Force empty
        }
      }
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      let orParts = [
        `name.ilike.%${q}%`,
        `part_number.ilike.%${q}%`
      ]

      // Fetch matching related IDs
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
      console.error("Failed to fetch inventory:", error)
      setParts([])
      setTotalCount(0)
    }
    
    setIsLoading(false)
  }, [supabase, searchQuery, stockFilter, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchInventory])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, stockFilter])

  const handleExport = async () => {
    // Export should probably export the whole filtered dataset, not just the page.
    // We'll fetch all matching items for export.
    let exportQuery = supabase
      .from('parts')
      .select('*, brands(name), part_groups(name), part_categories(name)')
      .order('name')
      
    // Apply filters identically to fetchInventory
    if (stockFilter === 'out-of-stock') {
      exportQuery = exportQuery.lte('stock_quantity', 0)
    } else if (stockFilter === 'in-stock' || stockFilter === 'low-stock') {
      const { data: stockData } = await supabase.from('parts').select('id, stock_quantity, reorder_level')
      if (stockData) {
        const matchingIds = stockData.filter(p => {
          const stock = Number(p.stock_quantity) || 0
          const reorder = Number(p.reorder_level) || 0
          if (stockFilter === 'in-stock') return stock > reorder
          if (stockFilter === 'low-stock') return stock > 0 && stock <= reorder
          return false
        }).map(p => p.id)
        
        if (matchingIds.length > 0) {
          exportQuery = exportQuery.in('id', matchingIds)
        } else {
          exportQuery = exportQuery.eq('id', '00000000-0000-0000-0000-000000000000')
        }
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      let orParts = [
        `name.ilike.%${q}%`,
        `part_number.ilike.%${q}%`
      ]

      const [{ data: brands }, { data: groups }, { data: categories }] = await Promise.all([
        supabase.from('brands').select('id').ilike('name', `%${q}%`),
        supabase.from('part_groups').select('id').ilike('name', `%${q}%`),
        supabase.from('part_categories').select('id').ilike('name', `%${q}%`)
      ])

      if (brands && brands.length > 0) orParts.push(`brand_id.in.(${brands.map(b => b.id).join(',')})`)
      if (groups && groups.length > 0) orParts.push(`group_id.in.(${groups.map(g => g.id).join(',')})`)
      if (categories && categories.length > 0) orParts.push(`category_id.in.(${categories.map(c => c.id).join(',')})`)

      exportQuery = exportQuery.or(orParts.join(','))
    }

    const { data: allParts } = await exportQuery

    if (!allParts || allParts.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ['Part / Product', 'Part No.', 'Brand', 'Current Stock', 'Cost', 'Stock Value', 'Reorder Level', 'Status'];
    
    const rows = allParts.map(p => {
      const stock = Number(p.stock_quantity) || 0;
      const reorder = Number(p.reorder_level) || 0;
      const cost = Number(p.cost) || 0;
      const stockValue = stock * cost;
      
      let statusStr = 'In Stock';
      if (stock <= 0) statusStr = 'Out of Stock';
      else if (stock <= reorder) statusStr = 'Low Stock';
      
      return [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.part_number || '—').replace(/"/g, '""')}"`,
        `"${(p.brands?.name || '—').replace(/"/g, '""')}"`,
        stock,
        cost.toFixed(2),
        stockValue.toFixed(2),
        reorder,
        `"${statusStr}"`
      ].join(',')
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getStatusDisplay = (stock: number, reorder: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} className="mr-1" /> }
    if (stock <= reorder) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle size={14} className="mr-1" /> }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 size={14} className="mr-1" /> }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500 mt-1">Operational stock overview and traceability</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition shadow-sm flex items-center gap-2"
          >
            <Download size={18} /> Export Inventory
          </button>
          <Link 
            href="/print/inventory-count" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition shadow-sm flex items-center gap-2"
          >
            <Printer size={18} /> Print Count Sheet
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 shrink-0 rounded-t-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search part, SKU, brand, category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto bg-white"
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="flex flex-col items-center text-slate-500 gap-3">
              <ClipboardList className="animate-pulse text-slate-300" size={40} />
              <span className="font-medium">Loading inventory...</span>
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
                    <th className="px-6 py-3 font-medium text-right">CURRENT STOCK</th>
                    <th className="px-6 py-3 font-medium text-right">COST</th>
                    <th className="px-6 py-3 font-medium text-right">STOCK VALUE</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center mb-3"><ClipboardList className="text-slate-300" size={40} /></div>
                        <p className="text-base font-medium">No items found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    parts.map(part => {
                      const stock = Number(part.stock_quantity) || 0
                      const reorder = Number(part.reorder_level) || 0
                      const cost = Number(part.cost) || 0
                      const stockValue = stock * cost
                      const status = getStatusDisplay(stock, reorder)
                      
                      return (
                        <tr key={part.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                            <Link href={`/inventory/${part.id}`}>{part.name}</Link>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-sm font-medium">{part.part_number || '—'}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{part.brands?.name || '—'}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 text-right text-base">{stock}</td>
                          <td className="px-6 py-4 text-slate-500 text-right font-medium">
                            ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 text-right">
                            ₱{stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${status.color.replace('bg-', 'border-').replace('-100', '-200')} ${status.color}`}>
                              {status.icon} {status.label}
                            </span>
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
