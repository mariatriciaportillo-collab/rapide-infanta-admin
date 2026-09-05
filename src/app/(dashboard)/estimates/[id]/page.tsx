import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Download, CheckCircle2, FileText, User as UserIcon, Building2, Car, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { EstimateActionBar } from '@/components/estimates/EstimateActionBar'

export default async function ViewEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  
  // Await the params object before using its properties (Next.js 15+ requirement)
  const { id } = await params

  // Fetch the estimate with its items
  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      estimate_items(*)
    `)
    .eq('id', id)
    .single()

  if (error || !estimate) {
    notFound()
  }

  // Sort items by sort_order
  const items = estimate.estimate_items.sort((a: any, b: any) => a.sort_order - b.sort_order)
  const normalizedStatus = (estimate.status || 'DRAFT').toUpperCase()
  
  const isCompany = estimate.customer_type?.toLowerCase() === 'company'

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link href="/estimates" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-800">Estimate #{estimate.estimate_number}</h2>
            {(normalizedStatus !== 'JOB STARTED' && normalizedStatus !== 'APPROVED' && normalizedStatus !== 'COMPLETED') && (
              <Link href={`/estimates/${estimate.id}/edit`} className="text-slate-400 hover:text-blue-600 transition" title="Edit">
                <Edit size={20} />
              </Link>
            )}
          </div>
          
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${normalizedStatus === 'APPROVED' || normalizedStatus === 'JOB STARTED' ? 'bg-green-100 text-green-700' : 
              normalizedStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 
              normalizedStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700'}`}
          >
            {normalizedStatus}
          </span>
        </div>
        
        <EstimateActionBar estimateId={estimate.id} initialStatus={normalizedStatus} />
      </div>

      {/* Main Document View */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Document Header (similar to print layout but styled for screen) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
          <div>
            <div className="flex items-end gap-3 mb-2">
              <img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-10 w-auto object-contain" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">INFANTA</h2>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800 space-y-0.5">
              <p>OPERATED BY: MGP AUTO REPAIR CENTER</p>
              <p>PUROK 2, BRGY. MISWA INFANTA, QUEZON</p>
              <p>0920-416-4552</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-4">Estimate</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-slate-500 font-medium">Estimate No:</div>
              <div className="font-bold text-slate-900">{estimate.estimate_number}</div>
              <div className="text-slate-500 font-medium">Date:</div>
              <div className="font-bold text-slate-900">{format(new Date(estimate.created_at), 'MMMM d, yyyy')}</div>
              <div className="text-slate-500 font-medium">Valid Until:</div>
              <div className="font-bold text-slate-900">
                {format(new Date(new Date(estimate.created_at).getTime() + 7 * 24 * 60 * 60 * 1000), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Customer & Vehicle Info */}
        <div className="bg-white border-b border-slate-200">
          <div className="grid grid-cols-2 divide-x divide-slate-100 p-4">
            {/* Quoted To */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />}
                Estimate For
              </h3>
              <div className="text-slate-800 text-sm leading-snug">
                <div className="font-bold text-base">{estimate.customer_name}</div>
                {estimate.customer_telephone && <div className="text-slate-600 mt-0.5">{estimate.customer_telephone}</div>}
                {isCompany && estimate.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {estimate.contact_person}</div>}
              </div>
            </div>
            
            {/* Vehicle Details */}
            <div className="pl-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Car size={12} />
                Vehicle Details
              </h3>
              <div className="text-slate-800 text-sm space-y-1">
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Plate:</span><span className="font-medium uppercase">{estimate.vehicle_plate}</span></div>
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Model:</span><span className="font-medium">{estimate.vehicle_make} {estimate.vehicle_model}</span></div>
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Year:</span><span className="font-medium">{estimate.vehicle_year || '-'}</span></div>
              </div>
            </div>
          </div>
          
          {/* Service Details Strip */}
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex gap-4 text-sm">
            <div><span className="text-slate-500 font-medium mr-2">Service Advisor:</span><span className="font-bold text-slate-800">{estimate.service_advisor_name || '-'}</span></div>
            <div><span className="text-slate-500 font-medium mr-2">Mechanic:</span><span className="font-bold text-slate-800">{estimate.mechanic_name || '-'}</span></div>
            <div><span className="text-slate-500 font-medium mr-2">Mileage:</span><span className="font-bold text-slate-800">{estimate.mileage_km ? `${estimate.mileage_km.toLocaleString()} km` : '-'}</span></div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-4 pb-4 space-y-6">
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
                <span>₱{Number(estimate.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              
              {Number(estimate.discount_amount) > 0 && (
                <div className="flex justify-between text-red-600 text-sm font-medium">
                  <span>Discount</span>
                  <span>- ₱{Number(estimate.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
              )}
              
              <div className="h-px bg-slate-300 my-2"></div>
              
              <div className="flex justify-between text-slate-900 font-bold text-xl">
                <span>Grand Total</span>
                <span>₱{Number(estimate.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-sm flex justify-between gap-12">
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Notes / Remarks</h4>
              <p className="text-slate-600 whitespace-pre-wrap">{estimate.notes || 'None'}</p>
            </div>
            
          </div>
          
          
        </div>


        {/* Signatures */}
        <div className="mt-6 px-16 flex justify-between gap-16 pb-12">
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1 h-12"></div>
            <p className="text-xs font-bold text-slate-800 uppercase">{estimate.prepared_by}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
          </div>
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1 h-12"></div>
            <p className="text-xs font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>
          </div>
        </div>
      </div>
    </div>
  )
}
