'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

export default function QuotationPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const supabase = createClient()
  
  const [quote, setQuote] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuote() {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items(*)
        `)
        .eq('id', id)
        .single()
        
      if (data) {
        setQuote(data)
        setItems(data.quotation_items.sort((a: any, b: any) => a.sort_order - b.sort_order))
      }
      setLoading(false)
    }
    
    loadQuote()
  }, [id, supabase])

  useEffect(() => {
    if (!loading && quote) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, quote])

  if (loading) return <div className="p-8 text-center">Loading document...</div>
  if (!quote) return <div className="p-8 text-center text-red-500">Document not found</div>

  const isCompany = quote.customer_type === 'company'

  return (
    <div className="bg-white text-black min-h-screen w-full max-w-[210mm] mx-auto print:w-full print:max-w-none print:m-0 font-sans text-sm pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start pt-8 px-8 pb-6 border-b-2 border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-blue-900 tracking-tighter mb-1">RAPIDÉ</h1>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Auto Service Experts</p>
          <div className="mt-3 text-xs text-slate-600 space-y-0.5">
            <p>Infanta Branch</p>
            <p>123 Main Highway, Infanta, Quezon</p>
            <p>042-123-4567 / 0917-123-4567</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-4">Quotation</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-slate-500 font-medium">Quote No:</div>
            <div className="font-bold text-slate-900">{quote.quote_number}</div>
            <div className="text-slate-500 font-medium">Date:</div>
            <div className="font-bold text-slate-900">{format(new Date(quote.created_at), 'MMM d, yyyy')}</div>
            <div className="text-slate-500 font-medium">Valid Until:</div>
            <div className="font-bold text-slate-900">
              {format(new Date(new Date(quote.created_at).getTime() + 7 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column info */}
      <div className="flex border-b border-slate-300">
        
        {/* Bill To */}
        <div className="flex-1 p-6 border-r border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quoted To</h3>
          <div className="space-y-0.5 text-slate-800 text-sm">
            <div className="font-bold text-base">{quote.customer_name}</div>
            
            {isCompany && quote.contact_person && (
              <div>Attn: {quote.contact_person}</div>
            )}
            
            {quote.customer_telephone && (
              <div>{quote.customer_telephone}</div>
            )}
            
            {quote.customer_email && <div>{quote.customer_email}</div>}
            {quote.customer_address && <div>{quote.customer_address}</div>}
            
            {isCompany && quote.customer_tin && (
              <div className="pt-1 font-medium">TIN: {quote.customer_tin}</div>
            )}
          </div>
        </div>
        
        {/* Vehicle */}
        <div className="w-1/3 p-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Details</h3>
          <div className="space-y-1 text-slate-800 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plate:</span>
              <span className="font-bold uppercase">{quote.vehicle_plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model:</span>
              <span className="font-medium">{quote.vehicle_make} {quote.vehicle_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Year:</span>
              <span className="font-medium">{quote.vehicle_year || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mileage:</span>
              <span className="font-medium">{quote.mileage_km ? `${quote.mileage_km.toLocaleString()} km` : '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-6 space-y-6">
        
        {/* Helper variables */}
        {(() => {
          const sortedItems = [...items].sort((a: any, b: any) => a.sort_order - b.sort_order);
          const packages = sortedItems.filter((i: any) => i.item_type === 'PACKAGE');
          const laborItems = sortedItems.filter((i: any) => !i.item_type || i.item_type === 'MANUAL' || i.item_type === 'LABOR' || (i.item_type === 'PACKAGE_ITEM' && i.labor_service_id));
          const partItems = sortedItems.filter((i: any) => i.item_type === 'PART' || (i.item_type === 'PACKAGE_ITEM' && (i.part_id || i.is_category)));

          const getParentPackageName = (parentId: string) => {
            return sortedItems.find((p: any) => p.id === parentId)?.description || 'Package';
          };

          return (
            <>
              {/* PACKAGES */}
              {packages.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-2">Packages</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-1 w-3/5 font-normal">Description</th>
                        <th className="py-1 text-center w-1/12 font-normal">Qty</th>
                        <th className="py-1 text-right w-1/6 font-normal">Unit Price</th>
                        <th className="py-1 text-right w-1/6 font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packages.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-1.5 pr-4 text-slate-800 font-bold">{item.description}</td>
                          <td className="py-1.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-1.5 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                          <td className="py-1.5 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* LABOR & SERVICES */}
              {laborItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-2">Labor & Services</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-1 w-3/5 font-normal">Description</th>
                        <th className="py-1 text-center w-1/12 font-normal">Qty</th>
                        <th className="py-1 text-right w-1/6 font-normal">Unit Price</th>
                        <th className="py-1 text-right w-1/6 font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {laborItems.map((item: any) => {
                        if (item.is_section_header) {
                          return (
                            <tr key={item.id} className="bg-slate-50">
                              <td colSpan={4} className="py-1.5 px-1 font-bold text-slate-800 uppercase tracking-wider text-xs">
                                {item.description}
                              </td>
                            </tr>
                          )
                        }
                        
                        return (
                          <tr key={item.id}>
                            <td className="py-1.5 pr-4">
                              <div className="text-slate-800 font-medium">{item.description}</div>
                              {item.item_type === 'PACKAGE_ITEM' && (
                                <div className="text-[10px] text-slate-500 italic mt-0.5">
                                  Included in: {getParentPackageName(item.parent_item_id)}
                                </div>
                              )}
                            </td>
                            <td className="py-1.5 text-center text-slate-600 align-top">{item.quantity}</td>
                            <td className="py-1.5 text-right text-slate-600 align-top">
                              {item.item_type === 'PACKAGE_ITEM' ? (
                                <span className="text-slate-400 italic text-xs">Included in Package</span>
                              ) : (
                                `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                              )}
                            </td>
                            <td className="py-1.5 text-right font-medium text-slate-800 align-top">
                              {item.item_type === 'PACKAGE_ITEM' ? (
                                <span className="text-slate-400 italic text-xs">—</span>
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
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-2">Parts & Materials</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-1 w-3/5 font-normal">Description</th>
                        <th className="py-1 text-center w-1/12 font-normal">Qty</th>
                        <th className="py-1 text-right w-1/6 font-normal">Unit Price</th>
                        <th className="py-1 text-right w-1/6 font-normal">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partItems.map((item: any) => (
                        <tr key={item.id}>
                          <td className="py-1.5 pr-4">
                            <div className="text-slate-800 font-medium">{item.description}</div>
                            {item.item_type === 'PACKAGE_ITEM' && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5">
                                Included in: {getParentPackageName(item.parent_item_id)}
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 text-center text-slate-600 align-top">{item.quantity}</td>
                          <td className="py-1.5 text-right text-slate-600 align-top">
                            {item.item_type === 'PACKAGE_ITEM' ? (
                              <span className="text-slate-400 italic text-xs">Included in Package</span>
                            ) : (
                              `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                            )}
                          </td>
                          <td className="py-1.5 text-right font-medium text-slate-800 align-top">
                            {item.item_type === 'PACKAGE_ITEM' ? (
                              <span className="text-slate-400 italic text-xs">—</span>
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
      <div className="px-6 flex justify-end">
        <div className="w-1/2 min-w-[250px]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal</span>
              <span>₱{Number(quote.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            
            {Number(quote.discount_amount) > 0 && (
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Discount</span>
                <span>- ₱{Number(quote.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            
            <div className="h-0.5 bg-slate-800 my-1"></div>
            
            <div className="flex justify-between text-slate-900 font-bold text-lg">
              <span>Grand Total</span>
              <span>₱{Number(quote.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 px-6 pt-6 border-t-2 border-slate-800 flex justify-between gap-8 page-break-inside-avoid">
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Notes / Remarks</h4>
            <p className="text-slate-600 text-xs whitespace-pre-wrap">{quote.notes || 'None'}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Warranty Terms</h4>
            <p className="text-slate-600 text-xs">{quote.warranty_terms}</p>
          </div>
        </div>
        
        <div className="w-48 text-center pt-8">
          <div className="border-b border-slate-800 mb-1"></div>
          <p className="font-bold text-slate-800 text-xs">{quote.prepared_by}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Prepared By</p>
        </div>
      </div>

      {/* Disclaimer / Signature */}
      <div className="mt-12 px-6 flex justify-between items-end page-break-inside-avoid">
        <div className="w-1/2 text-[10px] text-slate-500 text-justify pr-8">
          This quotation is valid for 7 days. Prices may change without prior notice. 
          The final invoice amount may vary depending on actual labor time and parts used during repair.
        </div>
        <div className="w-48 text-center">
          <div className="border-b border-slate-800 mb-1"></div>
          <p className="font-bold text-slate-800 text-xs">Customer Signature</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Conforme</p>
        </div>
      </div>

    </div>
  )
}
