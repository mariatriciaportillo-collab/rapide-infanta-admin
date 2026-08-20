'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, User, Calendar, FileText, CheckCircle, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export function StockSwapDetailClient({ id }: { id: string }) {
  const supabase = createClient()
  
  const [swap, setSwap] = useState<any>(null)
  const [itemOut, setItemOut] = useState<any>(null)
  const [itemIn, setItemIn] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch swap transaction
    const { data: txData } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('id', id)
      .eq('type', 'SWAP')
      .single()
      
    if (txData) {
      setSwap(txData)
      
      // Fetch movements (items in and out)
      const { data: moveData } = await supabase
        .from('inventory_movements')
        .select('*, parts(name, part_number, unit)')
        .eq('transaction_id', id)
        
      if (moveData) {
        setItemOut(moveData.find(m => m.movement_type === 'SWAP_OUT'))
        setItemIn(moveData.find(m => m.movement_type === 'SWAP_IN'))
      }
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading stock swap...</div>
  }

  if (!swap) {
    return <div className="p-8 text-center text-slate-500">Stock Swap not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/stock-adjustments" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">{swap.reference_number}</h2>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">SWAP</span>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-green-200">
          <CheckCircle size={16} /> Completed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Calendar size={14} /> Date & Time</div>
            <div className="font-medium text-slate-800">{format(new Date(swap.created_at), 'MMMM d, yyyy h:mm a')}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FileText size={14} /> Reason</div>
            <div className="font-medium text-slate-800">{swap.reason}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><User size={14} /> Created By</div>
            <div className="font-medium text-slate-800 text-sm">{swap.created_by || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FileText size={14} /> Notes</div>
            <div className="text-slate-600">{swap.notes || 'None'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ITEM OUT */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-red-50 flex items-center justify-between">
            <h3 className="font-bold text-red-700">ITEM OUT</h3>
            <span className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded border border-red-200">DEDUCT</span>
          </div>
          {itemOut ? (
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Part / Material</div>
                <div className="font-bold text-lg text-slate-800">{itemOut.parts?.name || 'Unknown Part'}</div>
                <div className="text-sm font-mono text-slate-500 mt-1">{itemOut.parts?.part_number || 'No SKU'}</div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Qty Out</div>
                  <div className="font-bold text-2xl text-red-600">{itemOut.quantity} <span className="text-sm font-normal">{itemOut.parts?.unit || 'pcs'}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Movement</div>
                  <div className="font-medium text-slate-700 text-sm italic">
                    Historical states unrecorded.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No Item Out record found.</div>
          )}
        </div>

        {/* ITEM IN */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-green-50 flex items-center justify-between">
            <h3 className="font-bold text-green-700">ITEM IN</h3>
            <span className="text-xs font-bold bg-white text-green-600 px-2 py-1 rounded border border-green-200">ADD</span>
          </div>
          {itemIn ? (
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Part / Material</div>
                <div className="font-bold text-lg text-slate-800">{itemIn.parts?.name || 'Unknown Part'}</div>
                <div className="text-sm font-mono text-slate-500 mt-1">{itemIn.parts?.part_number || 'No SKU'}</div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Qty In</div>
                  <div className="font-bold text-2xl text-green-600">+{itemIn.quantity} <span className="text-sm font-normal">{itemIn.parts?.unit || 'pcs'}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Movement</div>
                  <div className="font-medium text-slate-700 text-sm italic">
                    Historical states unrecorded.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No Item In record found.</div>
          )}
        </div>
      </div>
      
    </div>
  )
}
