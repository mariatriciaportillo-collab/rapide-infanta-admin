'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

export default function EstimatePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const supabase = createClient()
  
  const [estimate, setQuote] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuote() {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          estimate_items(*)
        `)
        .eq('id', id)
        .single()
        
      if (data) {
        setQuote(data)
        setItems(data.estimate_items.sort((a: any, b: any) => a.sort_order - b.sort_order))
      }
      setLoading(false)
    }
    
    loadQuote()
  }, [id, supabase])

  useEffect(() => {
    if (!loading && estimate) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, estimate])

  if (loading) return <div className="p-6 text-center">Loading document...</div>
  if (!estimate) return <div className="p-6 text-center text-red-500">Document not found</div>

  const isCompany = estimate.customer_type === 'company'

  return (
    <div className="bg-white text-black min-h-screen w-full max-w-[210mm] mx-auto print:w-full print:max-w-none print:m-0 font-sans text-sm pb-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
        }
      `}} />
      
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
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Estimate</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-slate-500 font-medium">Estimate No:</div>
            <div className="font-bold text-slate-900">{estimate.estimate_number}</div>
            <div className="text-slate-500 font-medium">Date:</div>
            <div className="font-bold text-slate-900">{format(new Date(estimate.created_at), 'MMM d, yyyy')}</div>
            <div className="text-slate-500 font-medium">Valid Until:</div>
            <div className="font-bold text-slate-900">
              {format(new Date(new Date(estimate.created_at).getTime() + 7 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column info */}
      <div className="flex border-y border-slate-300">
        {/* Bill To */}
        <div className="w-1/3 p-3 border-r border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quoted To</h3>
          <div className="space-y-0.5 text-slate-800 text-sm">
            <div className="font-bold text-base">{estimate.customer_name}</div>
            
            {isCompany && estimate.contact_person && (
              <div className="text-slate-600">Attn: {estimate.contact_person}</div>
            )}
            
            {estimate.customer_telephone && (
              <div>{estimate.customer_telephone}</div>
            )}
            
            {estimate.customer_email && <div>{estimate.customer_email}</div>}
            {estimate.customer_address && <div>{estimate.customer_address}</div>}
            
            {isCompany && estimate.customer_tin && (
              <div className="pt-1 font-medium">TIN: {estimate.customer_tin}</div>
            )}
          </div>
        </div>
        
        {/* Vehicle */}
        <div className="w-1/3 p-3 border-r border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Details</h3>
          <div className="space-y-1 text-slate-800 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plate:</span>
              <span className="font-bold uppercase">{estimate.vehicle_plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model:</span>
              <span className="font-medium">{estimate.vehicle_make} {estimate.vehicle_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Year:</span>
              <span className="font-medium">{estimate.vehicle_year || '-'}</span>
            </div>
          </div>
        </div>

        </div>

      {/* Items Table */}
      <div className="px-8 pt-3 pb-1 space-y-2">
        {(() => {
          const sortedItems = [...items].sort((a: any, b: any) => a.sort_order - b.sort_order);
          const isPkg = (i: any) => i.item_type === 'PACKAGE' || (!i.parent_item_id && i.package_id);
          const isPrt = (i: any) => i.item_type === 'PART' || (!i.parent_item_id && i.part_id && !i.package_id) || (i.parent_item_id && (i.part_id || i.is_category));
          const isLbr = (i: any) => !isPkg(i) && !isPrt(i);

          const packages = sortedItems.filter(isPkg);
          const partItems = sortedItems.filter(isPrt);
          const laborItems = sortedItems.filter(isLbr);

          return (
            <>
              {/* PACKAGES */}
              {packages.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">PACKAGES</h3>
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
                      {packages.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-0 pr-2 text-slate-800 font-normal">{item.description}</td>
                          <td className="py-0 px-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-0 px-2 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="py-0 pl-2 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LABOR & SERVICES */}
              {laborItems.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">LABOR & SERVICES</h3>
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
                      {laborItems.map((item: any) => {
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
              )}

              {/* PARTS & MATERIALS */}
              {partItems.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">PARTS & MATERIALS</h3>
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
                      {partItems.map((item: any) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Totals */}
      <div className="px-8 flex justify-end">
        <div className="w-1/2 min-w-[250px]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal</span>
              <span>₱{Number(estimate.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            
            {Number(estimate.discount_amount) > 0 && (
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Discount</span>
                <span>- ₱{Number(estimate.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            
            <div className="h-0.5 bg-slate-800 my-1"></div>
            
            <div className="flex justify-between text-slate-900 font-bold text-lg">
              <span>Grand Total</span>
              <span>₱{Number(estimate.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 px-8 pt-2 border-t-2 border-slate-800 flex justify-between gap-6 page-break-inside-avoid">
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Notes / Remarks</h4>
            <p className="text-slate-600 text-xs whitespace-pre-wrap">{estimate.notes || 'None'}</p>
          </div>
          
        </div>
        
        
      </div>

      {/* Legal, Warranty, and Signatures */}
      <div className="mt-3 px-8 grid grid-cols-2 gap-4 page-break-inside-avoid">
        {/* PLEASE READ Notice */}
        <div className="border border-slate-300 rounded p-4 flex flex-col bg-slate-50/50 md:col-span-2">
          <h3 className="font-bold text-slate-800 text-[11px] mb-2 uppercase border-b border-slate-200 pb-1 tracking-wider">PLEASE READ</h3>
          <p className="text-[9px] text-slate-700 text-justify leading-relaxed">
            Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-6 px-16 flex justify-between gap-16 page-break-inside-avoid pb-8">
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">{estimate.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>
        </div>
      </div>
    </div>
  )
}