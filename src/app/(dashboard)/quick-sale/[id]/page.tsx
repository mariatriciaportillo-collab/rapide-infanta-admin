'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Printer, FileText, CheckCircle, Edit, Building2, User as UserIcon, Car } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function QuickSaleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const supabase = createClient()
  const router = useRouter()
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('quick_sales')
        .select(`
          *,
          quick_sale_items(*),
          customers:customer_id(*),
          vehicles:vehicle_id(*)
        `)
        .eq('id', id)
        .single()
      if (data) setSale(data)
      setLoading(false)
    }
    load()
  }, [id, supabase])

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!sale) return <div className="p-6 text-center text-red-500">Quick Sale not found</div>

  const isCompany = sale.customers?.customer_type === 'company'

  const handleComplete = async () => {
    if (!confirm('Complete this Quick Sale? This will deduct inventory and lock the record.')) return;
    
    // Deduct inventory
    for (const item of sale.quick_sale_items) {
      if (item.part_id) {
        const { data: currentPart } = await supabase.from('parts_inventory').select('stock_quantity').eq('id', item.part_id).single()
        if (currentPart) {
          await supabase.from('parts_inventory').update({ stock_quantity: Number(currentPart.stock_quantity) - Number(item.quantity) }).eq('id', item.part_id)
        }
      }
    }

    await supabase.from('quick_sales').update({ status: 'COMPLETED' }).eq('id', id)
    window.location.reload()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/quick-sale" className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm border border-slate-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{sale.quick_sale_number}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                sale.status === 'DRAFT' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {sale.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Created {format(new Date(sale.created_at), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/quick-sale/${sale.id}/print`} target="_blank" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
            <Printer size={16} /> Print
          </Link>
          
          {sale.status === 'DRAFT' && (
            <button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <CheckCircle size={16} /> Complete Sale
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-4">
          {/* Customer */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />} Customer
            </h3>
            <div className="text-slate-800 text-sm leading-snug">
              <div className="font-bold text-base">{isCompany ? sale.customers?.company_name : `${sale.customers?.first_name} ${sale.customers?.last_name}`}</div>
              {sale.customers?.telephone && <div className="text-slate-600 mt-0.5">{sale.customers.telephone}</div>}
              {isCompany && sale.customers?.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {sale.customers.contact_person}</div>}
            </div>
          </div>
          {/* Vehicle */}
          <div className="md:pl-4 pt-4 md:pt-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Car size={12} /> Vehicle
            </h3>
            {sale.vehicles ? (
              <div className="text-slate-800 text-sm space-y-1">
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Plate:</span><span className="font-medium uppercase">{sale.vehicles.plate_number}</span></div>
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Model:</span><span className="font-medium">{sale.vehicles.make} {sale.vehicles.model}</span></div>
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Year:</span><span className="font-medium">{sale.vehicles.year || '-'}</span></div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm italic">No vehicle selected</div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Parts & Materials</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2 font-semibold">Description</th>
              <th className="px-4 py-2 font-semibold text-center w-20">Qty</th>
              <th className="px-4 py-2 font-semibold text-right w-32">Unit Price</th>
              <th className="px-4 py-2 font-semibold text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sale.quick_sale_items?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{item.description}</td>
                <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-600">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Remarks</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{sale.notes || 'None'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-end text-center w-64">
            <div className="border-b border-slate-800 mb-1 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase truncate px-1">{sale.prepared_by}</p>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">PREPARED BY</p>
          </div>
        </div>

        <div className="w-full md:w-80 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex justify-between text-slate-600 text-sm">
            <span>Subtotal</span>
            <span>₱{Number(sale.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          {Number(sale.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-600 text-sm font-medium">
              <span>Discount</span>
              <span>- ₱{Number(sale.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          )}
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex justify-between items-end text-slate-900 font-bold">
            <span className="text-sm uppercase tracking-wider">Grand Total</span>
            <span className="text-2xl text-blue-600 tracking-tight">₱{Number(sale.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
