'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Search, Filter, ClipboardList, AlertCircle, CheckCircle2, XCircle, Download, Printer } from 'lucide-react'

export default function InventoryListPage() {
  const supabase = createClient()
  
  const [parts, setParts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setIsLoading(true)
    let query = supabase
      .from('parts')
      .select('*, brands(name), part_groups(name), part_categories(name)')
      .order('name')
      
    const { data } = await query
    if (data) setParts(data)
    setIsLoading(false)
  }

  const handleExport = () => {
    const headers = ['Part / Product', 'Part No.', 'Brand', 'Current Stock', 'Cost', 'Stock Value', 'Reorder Level', 'Status']
    const rows = parts.map(p => {
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

  const filteredParts = parts.filter(p => {
    // Search
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      p.name.toLowerCase().includes(q) || 
      (p.part_number && p.part_number.toLowerCase().includes(q)) ||
      (p.brands?.name && p.brands.name.toLowerCase().includes(q)) ||
      (p.part_groups?.name && p.part_groups.name.toLowerCase().includes(q)) ||
      (p.part_categories?.name && p.part_categories.name.toLowerCase().includes(q))
      
    // Stock Status
    const stockQty = Number(p.stock_quantity) || 0
    const reorderLevel = Number(p.reorder_level) || 0
    
    let matchesStatus = true
    if (stockFilter === 'in-stock') matchesStatus = stockQty > reorderLevel
    else if (stockFilter === 'low-stock') matchesStatus = stockQty > 0 && stockQty <= reorderLevel
    else if (stockFilter === 'out-of-stock') matchesStatus = stockQty <= 0

    return matchesSearch && matchesStatus
  })

  const getStatusDisplay = (stock: number, reorder: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} className="mr-1" /> }
    if (stock <= reorder) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle size={14} className="mr-1" /> }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 size={14} className="mr-1" /> }
  }

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
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

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
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
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><ClipboardList className="animate-pulse text-slate-300" size={32} /></div>
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><ClipboardList className="text-slate-300" size={32} /></div>
                    No items found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const stock = Number(part.stock_quantity) || 0
                  const reorder = Number(part.reorder_level) || 0
                  const cost = Number(part.cost) || 0
                  const stockValue = stock * cost
                  const status = getStatusDisplay(stock, reorder)
                  
                  return (
                    <tr key={part.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-blue-600 hover:underline">
                        <Link href={`/inventory/${part.id}`}>{part.name}</Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm">{part.part_number || '—'}</td>
                      <td className="px-6 py-4 text-slate-600">{part.brands?.name || '—'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-right">{stock}</td>
                      <td className="px-6 py-4 text-slate-600 text-right font-medium">
                        ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-right">
                        ₱{stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
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
      </div>
    </div>
  )
}
