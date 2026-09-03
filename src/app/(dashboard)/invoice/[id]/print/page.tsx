'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

export default function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const supabase = createClient()
  const [inv, setInv] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items(*),
          customers:customer_id(*),
          vehicles:vehicle_id(*)
        `)
        .eq('id', id)
        .single()
      if (data) setInv(data)
      setLoading(false)
    }
    load()
  }, [id, supabase])

  useEffect(() => {
    if (!loading && inv) {
      setTimeout(() => window.print(), 500)
    }
  }, [loading, inv])

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!inv) return <div className="p-6 text-center text-red-500">Not found</div>

  const isCompany = inv.customers?.customer_type === 'company'
  const customerName = isCompany ? inv.customers?.company_name : `${inv.customers?.first_name} ${inv.customers?.last_name}`

  return (
    <div className="bg-white text-black min-h-screen w-full max-w-[210mm] mx-auto print:w-full print:max-w-none print:m-0 font-sans text-sm pb-10">
      <style dangerouslySetInnerHTML={{__html: `@media print { @page { size: auto; margin: 0mm; } body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; } }`}} />
      
      {/* Header */}
      <div className="flex justify-between items-start pt-10 px-8 pb-4 border-b-2 border-slate-800 print:pt-6">
        <div>
          <div className="flex items-end gap-3 mb-1">
            <img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-8 w-auto object-contain" />
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">INFANTA</h2>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-800 space-y-0.5">
            <p>OPERATED BY: MGP AUTO REPAIR CENTER</p>
            <p>PUROK 2, BRGY. MISWA INFANTA, QUEZON</p>
            <p>0920-416-4552</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Invoice</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-slate-500 font-medium">Invoice No:</div>
            <div className="font-bold text-slate-900">{inv.invoice_number}</div>
            <div className="text-slate-500 font-medium">Date:</div>
            <div className="font-bold text-slate-900">{format(new Date(inv.created_at), 'MMM d, yyyy')}</div>
            <div className="text-slate-500 font-medium">Status:</div>
            <div className="font-bold text-slate-900">{inv.status}</div>
          </div>
        </div>
      </div>

      {/* Top Information Summary */}
      <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
        <div className="p-4 pl-8">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Billed To</h3>
          <div className="text-slate-800 text-sm leading-snug">
            <div className="font-bold text-base">{customerName}</div>
            {inv.customers?.telephone && <div className="text-slate-600 mt-0.5">{inv.customers.telephone}</div>}
            {isCompany && inv.customers?.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {inv.customers.contact_person}</div>}
          </div>
        </div>
        
        <div className="p-4 pr-8 pl-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Details</h3>
          {inv.vehicles ? (
            <div className="text-slate-800 text-sm space-y-1">
              <div className="flex gap-2 items-center">
                <span className="text-slate-500 font-medium w-12">Plate:</span>
                <span className="font-medium uppercase">{inv.vehicles.plate_number}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 font-medium w-12">Model:</span>
                <span className="font-medium">{inv.vehicles.make} {inv.vehicles.model}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 italic">None</div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="px-8 pt-3 pb-1 space-y-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 mt-4">BILLING DETAILS</h3>
        <table className="w-full text-left text-sm border-t-2 border-slate-800">
          <thead className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-0 pr-2 w-[55%]">Description</th>
              <th className="py-0 px-2 text-center w-[10%]">Qty</th>
              <th className="py-0 px-2 text-right w-[15%]">Unit Price</th>
              <th className="py-0 pl-2 text-right w-[20%]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inv.invoice_items?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => {
              if (item.is_section_header) {
                return (
                  <tr key={item.id} className="bg-slate-50/50">
                    <td colSpan={4} className="py-0 px-1 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      {item.description}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={item.id}>
                  <td className="py-0 pr-2 text-slate-800 font-normal">{item.description}</td>
                  <td className="py-0 px-2 text-center text-slate-600 align-top">{item.quantity}</td>
                  <td className="py-0 px-2 text-right text-slate-600 align-top">
                    {!!item.parent_item_id ? (
                      <span className="text-slate-500 italic text-[11px]">Included</span>
                    ) : (
                      `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                    )}
                  </td>
                  <td className="py-0 pl-2 text-right font-medium text-slate-800 align-top">
                    {!!item.parent_item_id ? (
                      <span className="text-slate-500 italic text-[11px]">—</span>
                    ) : (
                      `₱${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-8 flex justify-end mt-4 mb-2">
        <div className="w-1/2 min-w-[250px]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal</span>
              <span>₱{Number(inv.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            {Number(inv.discount_amount) > 0 && (
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Discount</span>
                <span>- ₱{Number(inv.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="h-0.5 bg-slate-800 my-1"></div>
            <div className="flex justify-between text-slate-900 font-bold text-lg mb-1">
              <span>Grand Total</span>
              <span>₱{Number(inv.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-bold text-sm">
              <span>Total Paid</span>
              <span>₱{Number(inv.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xl mt-1 border-t border-slate-300 pt-1">
              <span>Balance Due</span>
              <span>₱{Number(inv.balance_due).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer, Legal, and Signatures */}
      <div className="mt-4 px-8 pt-2 border-t-2 border-slate-800 grid grid-cols-2 gap-8 page-break-inside-avoid pb-4">
        <div className="col-span-1 space-y-3">
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-0.5">Notes / Remarks</h4>
            <p className="text-slate-600 text-[10px] leading-tight whitespace-pre-wrap">{inv.notes || 'None'}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-[10px] mb-0.5 uppercase tracking-wider">PLEASE READ</h3>
            <p className="text-[9px] text-slate-600 text-justify leading-snug">
              This invoice serves as the final billing statement for the services rendered. Please make checks payable to MGP AUTO REPAIR CENTER. Thank you for your business!
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col text-center w-full max-w-[200px] ml-auto mt-2">
            <div className="border-b border-slate-800 mb-0.5 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase truncate leading-tight">{inv.prepared_by}</p>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">PREPARED BY</p>
          </div>
          <div className="flex flex-col text-center w-full max-w-[200px] ml-auto mt-2">
            <div className="border-b border-slate-800 mb-0.5 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase leading-tight">CUSTOMER'S SIGNATURE</p>
            <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">Customer Signature & Date/Time</p>
          </div>
        </div>
      </div>
    </div>
  )
}
