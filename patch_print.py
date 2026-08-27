import re

content = """'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { Printer, ArrowLeft } from 'lucide-react'

export default function InventoryCountPrintPage() {
  const supabase = createClient()
  
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInventory() {
      const { data, error } = await supabase
        .from('parts')
        .select('*, brands(name)')
        .eq('is_active', true)
        .order('name')
        
      if (error) {
        console.error("Print Error:", error)
      }
      if (data) {
        setParts(data)
      }
      setLoading(false)
    }
    
    fetchInventory()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-100">Loading inventory count sheet...</div>
  }

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0 font-sans text-slate-800">
      
      {/* Controls (Hidden when printing) */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <button 
          onClick={() => window.history.back()}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Printer size={18} /> Print or Save as PDF
        </button>
      </div>

      {/* A4 Landscape Document Container */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl print:shadow-none mx-4 md:mx-auto">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
          }
        `}} />
        <div className="p-8 md:p-12">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 mb-1">
                RAPIDÉ INFANTA
              </h1>
              <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Physical Inventory Count Sheet</h2>
            </div>
            
            <div className="grid grid-cols-[100px_200px] gap-y-3 text-sm">
              <span className="font-bold text-slate-700 mt-1">Count Date:</span>
              <div className="border-b border-slate-400 h-6"></div>
              
              <span className="font-bold text-slate-700 mt-1">Counted By:</span>
              <div className="border-b border-slate-400 h-6"></div>
              
              <span className="font-bold text-slate-700 mt-1">Verified By:</span>
              <div className="border-b border-slate-400 h-6"></div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                <th className="px-3 py-3 border border-slate-300 font-bold w-12 text-center">No.</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-64">Part / Product</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-32">Part No.</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-32">Brand</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-24 text-center">System<br/>Stock</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-24 text-center">Actual<br/>Count</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-24 text-center">Variance</th>
                <th className="px-4 py-3 border border-slate-300 font-bold w-48 text-center">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 border border-slate-300 text-center text-slate-500 italic">No inventory found</td>
                </tr>
              ) : (
                parts.map((part: any, index: number) => (
                  <tr key={part.id} className="text-sm">
                    <td className="px-3 py-2 border border-slate-300 text-center text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-2 border border-slate-300 font-bold text-slate-800">{part.name}</td>
                    <td className="px-4 py-2 border border-slate-300 text-slate-600 font-mono text-xs">{part.part_number || '—'}</td>
                    <td className="px-4 py-2 border border-slate-300 text-slate-600">{part.brands?.name || '—'}</td>
                    <td className="px-4 py-2 border border-slate-300 font-bold text-slate-900 text-center bg-slate-50">
                      {Number(part.stock_quantity) || 0}
                    </td>
                    <td className="px-4 py-2 border border-slate-300 text-center"></td>
                    <td className="px-4 py-2 border border-slate-300 text-center"></td>
                    <td className="px-4 py-2 border border-slate-300"></td>
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
"""

with open('src/app/print/inventory-count/page.tsx', 'w') as f:
    f.write(content)

