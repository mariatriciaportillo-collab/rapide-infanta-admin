import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Download, CheckCircle2, FileText, User as UserIcon, Building2, Car, Edit } from 'lucide-react'
import { format } from 'date-fns'

export default async function ViewQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  
  // Await the params object before using its properties (Next.js 15+ requirement)
  const { id } = await params

  // Fetch the quotation with its items
  const { data: quote, error } = await supabase
    .from('quotations')
    .select(`
      *,
      quotation_items(*)
    `)
    .eq('id', id)
    .single()

  if (error || !quote) {
    notFound()
  }

  // Sort items by sort_order
  const items = quote.quotation_items.sort((a: any, b: any) => a.sort_order - b.sort_order)
  
  const isCompany = quote.customer_type === 'company'

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/quotations" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Quotation #{quote.quote_number}</h2>
          
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${quote.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
              quote.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700'}`}
          >
            {quote.status}
          </span>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href={`/quotations/${quote.id}/print`} 
            target="_blank"
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Printer size={18} />
            Print
          </Link>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={18} />
            Mark Approved
          </button>
        </div>
      </div>

      {/* Main Document View */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Document Header (similar to print layout but styled for screen) */}
        <div className="p-8 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-blue-900 tracking-tighter mb-1">RAPIDÉ</h1>
            <p className="text-sm font-medium text-slate-500 tracking-widest uppercase">Auto Service Experts</p>
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p>Infanta Branch</p>
              <p>123 Main Highway, Infanta, Quezon</p>
              <p>042-123-4567 / 0917-123-4567</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-4">Quotation</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-slate-500 font-medium">Quote No:</div>
              <div className="font-bold text-slate-900">{quote.quote_number}</div>
              <div className="text-slate-500 font-medium">Date:</div>
              <div className="font-bold text-slate-900">{format(new Date(quote.created_at), 'MMMM d, yyyy')}</div>
              <div className="text-slate-500 font-medium">Valid Until:</div>
              <div className="font-bold text-slate-900">
                {format(new Date(new Date(quote.created_at).getTime() + 7 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
          
          {/* Bill To */}
          <div className="p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              {isCompany ? <Building2 size={14} /> : <UserIcon size={14} />}
              Quoted To
            </h3>
            <div className="space-y-1 text-slate-800">
              <div className="font-bold text-lg">{quote.customer_name}</div>
              
              {isCompany && quote.contact_person && (
                <div className="text-sm text-slate-600">Attn: {quote.contact_person}</div>
              )}
              
              {quote.customer_telephone && (
                <div className="text-sm text-slate-600 pt-1">{quote.customer_telephone}</div>
              )}
              
              {quote.customer_email && <div className="text-sm text-slate-600">{quote.customer_email}</div>}
              {quote.customer_address && <div className="text-sm text-slate-600 pt-1">{quote.customer_address}</div>}
              
              {isCompany && quote.customer_tin && (
                <div className="text-sm text-slate-600 pt-2 font-medium">TIN: {quote.customer_tin}</div>
              )}
            </div>
          </div>
          
          {/* Vehicle */}
          <div className="p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car size={14} />
              Vehicle Details
            </h3>
            <div className="space-y-2 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Plate Number:</span>
                <span className="font-bold uppercase bg-slate-100 px-2 rounded">{quote.vehicle_plate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Make / Model:</span>
                <span className="font-medium">{quote.vehicle_make} {quote.vehicle_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Year:</span>
                <span className="font-medium">{quote.vehicle_year || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Mileage:</span>
                <span className="font-medium">{quote.mileage_km ? `${quote.mileage_km.toLocaleString()} km` : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-8 pb-4 space-y-6">
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
                  <div>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-2">PACKAGES</h3>
                    <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="py-2 px-4 w-[55%] font-semibold">Description</th>
                            <th className="py-2 px-4 text-center w-[10%] font-semibold">Qty</th>
                            <th className="py-2 px-4 text-right w-[15%] font-semibold">Unit Price</th>
                            <th className="py-2 px-4 text-right w-[20%] font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {packages.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-4 text-slate-800 font-normal">{item.description}</td>
                              <td className="py-2 px-4 text-center text-slate-600">{item.quantity}</td>
                              <td className="py-2 px-4 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                              <td className="py-2 px-4 text-right font-bold text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* LABOR & SERVICES */}
                {laborItems.length > 0 && (
                  <div>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-2">LABOR & SERVICES</h3>
                    <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="py-2 px-4 w-[55%] font-semibold">Description</th>
                            <th className="py-2 px-4 text-center w-[10%] font-semibold">Qty</th>
                            <th className="py-2 px-4 text-right w-[15%] font-semibold">Unit Price</th>
                            <th className="py-2 px-4 text-right w-[20%] font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {laborItems.map((item: any) => {
                            if (item.is_section_header) {
                              return (
                                <tr key={item.id} className="bg-slate-50">
                                  <td colSpan={4} className="py-2 px-4 font-bold text-slate-800 uppercase tracking-wider text-xs">
                                    {item.description}
                                  </td>
                                </tr>
                              )
                            }
                            
                            return (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 px-4 text-slate-800 font-normal">{item.description}</td>
                                <td className="py-2 px-4 text-center text-slate-600 align-top">{item.quantity}</td>
                                <td className="py-2 px-4 text-right text-slate-600 align-top">
                                  {!!item.parent_item_id ? (
                                    <span className="text-slate-500 italic text-sm">Included</span>
                                  ) : (
                                    `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                                  )}
                                </td>
                                <td className="py-2 px-4 text-right font-medium text-slate-800 align-top">
                                  {!!item.parent_item_id ? (
                                    <span className="text-slate-500 italic text-sm">—</span>
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
                  </div>
                )}

                {/* PARTS & MATERIALS */}
                {partItems.length > 0 && (
                  <div>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-2">PARTS & MATERIALS</h3>
                    <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="py-2 px-4 w-[55%] font-semibold">Description</th>
                            <th className="py-2 px-4 text-center w-[10%] font-semibold">Qty</th>
                            <th className="py-2 px-4 text-right w-[15%] font-semibold">Unit Price</th>
                            <th className="py-2 px-4 text-right w-[20%] font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {partItems.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-4 text-slate-800 font-normal">{item.description}</td>
                              <td className="py-2 px-4 text-center text-slate-600 align-top">{item.quantity}</td>
                              <td className="py-2 px-4 text-right text-slate-600 align-top">
                                {!!item.parent_item_id ? (
                                  <span className="text-slate-500 italic text-sm">Included</span>
                                ) : (
                                  `₱${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                                )}
                              </td>
                              <td className="py-2 px-4 text-right font-medium text-slate-800 align-top">
                                {!!item.parent_item_id ? (
                                  <span className="text-slate-500 italic text-sm">—</span>
                                ) : (
                                  `₱${Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}`
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Totals Section */}
        <div className="px-8 pb-8 pt-2 flex justify-end">
          <div className="w-1/2 min-w-[300px]">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span>₱{Number(quote.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              
              {Number(quote.discount_amount) > 0 && (
                <div className="flex justify-between text-red-600 text-sm font-medium">
                  <span>Discount</span>
                  <span>- ₱{Number(quote.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
              )}
              
              <div className="h-px bg-slate-300 my-2"></div>
              
              <div className="flex justify-between text-slate-900 font-bold text-xl">
                <span>Grand Total</span>
                <span>₱{Number(quote.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-8 border-t border-slate-200 text-sm flex justify-between gap-12">
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Notes / Remarks</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{quote.notes || 'None'}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Warranty Terms</h4>
              <p className="text-slate-600">{quote.warranty_terms}</p>
            </div>
          </div>
          
          <div className="w-64 text-center">
            <div className="h-16 border-b border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">{quote.prepared_by}</p>
            <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Prepared By</p>
          </div>
        </div>

      </div>
    </div>
  )
}
