'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { Printer, ArrowLeft } from 'lucide-react'

export default function PurchaseOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const supabase = createClient()
  
  const [po, setPo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPo() {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(*),
          purchase_order_items(
            qty_ordered,
            unit_cost,
            total_amount,
            parts(name)
          ),
          auth_users:created_by(email)
        `)
        .eq('id', id)
        .single()
        
      if (data) {
        setPo(data)
      }
      setLoading(false)
    }
    
    loadPo()
  }, [id, supabase])

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-100">Loading document...</div>
  }

  if (!po) {
    return <div className="flex justify-center items-center h-screen bg-slate-100">Purchase Order not found.</div>
  }

  const items = po.purchase_order_items || []
  const subtotal = Number(po.total_amount) || 0
  // Existing schema does not currently track separate discounts/taxes on the PO parent, 
  // so we display the direct totals.
  
  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-white print:py-0 font-sans text-slate-800">
      
      {/* Controls (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
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

      {/* A4 Document Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl print:shadow-none mx-4 md:mx-auto">
        <div className="p-10 md:p-14">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2 mb-2">
                RAPIDÉ
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block -translate-y-2"></span>
              </h1>
              <p className="text-sm text-slate-600 font-medium">Rapidé Infanta</p>
              <p className="text-sm text-slate-600">Infanta, Quezon</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-300 uppercase tracking-widest mb-2">Purchase Order</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-slate-500 font-medium">PO Number:</span>
                <span className="font-bold text-slate-900">{po.po_number}</span>
                <span className="text-slate-500 font-medium">Order Date:</span>
                <span className="font-medium text-slate-900">{format(new Date(po.order_date || po.created_at), 'MMM dd, yyyy')}</span>
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold uppercase text-slate-900">{po.status}</span>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Vendor / Supplier</h3>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
              <p className="font-bold text-lg text-slate-800 mb-1">{po.suppliers?.name || 'Unknown Supplier'}</p>
              {po.suppliers?.address && <p className="text-sm text-slate-600">{po.suppliers.address}</p>}
              
              <div className="mt-3 flex flex-col gap-1 text-sm text-slate-600">
                {po.suppliers?.contact_person && (
                  <p><span className="font-medium mr-2">Contact:</span> {po.suppliers.contact_person}</p>
                )}
                {po.suppliers?.mobile && (
                  <p><span className="font-medium mr-2">Mobile:</span> {po.suppliers.mobile}</p>
                )}
                {po.suppliers?.telephone && (
                  <p><span className="font-medium mr-2">Telephone:</span> {po.suppliers.telephone}</p>
                )}
                {po.suppliers?.email && (
                  <p><span className="font-medium mr-2">Email:</span> {po.suppliers.email}</p>
                )}
                {po.suppliers?.tin && (
                  <p><span className="font-medium mr-2">TIN:</span> {po.suppliers.tin}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional PO Info */}
          {(po.expected_delivery_date || po.reference_number || po.terms) && (
            <div className="flex gap-8 mb-8 text-sm">
              {po.expected_delivery_date && (
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Expected Delivery</span>
                  <span className="font-medium text-slate-800">{format(new Date(po.expected_delivery_date), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {po.reference_number && (
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Reference No.</span>
                  <span className="font-medium text-slate-800">{po.reference_number}</span>
                </div>
              )}
              {po.terms && (
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400 mb-1">Terms</span>
                  <span className="font-medium text-slate-800">{po.terms}</span>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium rounded-tl-sm">Item / Description</th>
                  <th className="px-4 py-3 font-medium text-right w-24">Qty</th>
                  <th className="px-4 py-3 font-medium text-right w-32">Unit Cost</th>
                  <th className="px-4 py-3 font-medium text-right w-36 rounded-tr-sm">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b-2 border-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic">No items found</td>
                  </tr>
                ) : (
                  items.map((item: any, i: number) => {
                    const qty = Number(item.qty_ordered) || 0
                    const cost = Number(item.unit_cost) || 0
                    const amount = Number(item.total_amount) || (qty * cost)
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium">{item.parts?.name || 'Unknown Item'}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-800">{qty}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">
                          ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-800">
                          ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-12">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium text-sm">Subtotal</span>
                <span className="text-slate-800 font-bold text-sm">
                  ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {/* Placeholders for Tax/Discount if schema adds them in future */}
              <div className="flex justify-between py-3 border-b-2 border-slate-800">
                <span className="text-slate-800 font-black text-lg">TOTAL AMOUNT</span>
                <span className="text-slate-900 font-black text-lg">
                  ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {po.notes && (
            <div className="mb-12">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Notes & Instructions</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{po.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-16 mt-16 border-t border-slate-200">
            <div>
              <div className="border-b border-slate-400 mb-2 h-8"></div>
              <p className="text-xs font-bold text-slate-500 uppercase text-center">Prepared By</p>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-2 h-8"></div>
              <p className="text-xs font-bold text-slate-500 uppercase text-center">Approved By</p>
            </div>
            <div>
              <div className="border-b border-slate-400 mb-2 h-8"></div>
              <p className="text-xs font-bold text-slate-500 uppercase text-center">Supplier Acknowledgment</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
