import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import { format } from 'date-fns'

export default async function ViewQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch Quotation
  const { data: quote, error: quoteError } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .single()

  if (quoteError || !quote) {
    notFound()
  }

  // Fetch Items
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/quotations" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Quotation {quote.quote_number}</h2>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/quotations/${quote.id}/print`}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-md font-medium transition flex items-center gap-2"
          >
            <Printer size={18} />
            Print Quotation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Customer Information</h3>
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-slate-500">Name:</dt>
            <dd className="col-span-2 font-medium text-slate-900">{quote.customer_name}</dd>
            
            <dt className="text-slate-500">Email:</dt>
            <dd className="col-span-2 font-medium text-slate-900">{quote.customer_email || '-'}</dd>
            
            <dt className="text-slate-500">Address:</dt>
            <dd className="col-span-2 font-medium text-slate-900">{quote.customer_address || '-'}</dd>
          </dl>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Vehicle Information</h3>
          <dl className="grid grid-cols-4 gap-y-3 text-sm">
            <dt className="text-slate-500">Plate:</dt>
            <dd className="font-medium text-slate-900 uppercase">{quote.vehicle_plate}</dd>
            
            <dt className="text-slate-500">Make:</dt>
            <dd className="font-medium text-slate-900">{quote.vehicle_make || '-'}</dd>

            <dt className="text-slate-500">Model:</dt>
            <dd className="font-medium text-slate-900">{quote.vehicle_model || '-'}</dd>

            <dt className="text-slate-500">Year:</dt>
            <dd className="font-medium text-slate-900">{quote.vehicle_year || '-'}</dd>

            <dt className="text-slate-500">Mileage:</dt>
            <dd className="font-medium text-slate-900">{quote.mileage_km ? `${quote.mileage_km} km` : '-'}</dd>
          </dl>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Line Items</h3>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-16">#</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-center">Qty</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items?.map((item, i) => (
              item.is_section_header ? (
                <tr key={item.id} className="bg-slate-100">
                  <td colSpan={5} className="px-6 py-3 font-bold text-slate-900">
                    {item.description}
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3">{i + 1}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{item.description}</td>
                  <td className="px-6 py-3 text-center">{item.quantity}</td>
                  <td className="px-6 py-3 text-right">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-900">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Additional Information</h3>
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-slate-500">Date Created:</dt>
            <dd className="col-span-2 font-medium text-slate-900">{quote.created_at ? format(new Date(quote.created_at), 'PPP p') : '-'}</dd>
            
            <dt className="text-slate-500">Prepared By:</dt>
            <dd className="col-span-2 font-medium text-slate-900">{quote.prepared_by || '-'}</dd>
            
            <dt className="text-slate-500">Status:</dt>
            <dd className="col-span-2 font-medium text-slate-900">
              <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                ${quote.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                  quote.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'}`}
              >
                {quote.status}
              </span>
            </dd>

            <dt className="text-slate-500">Notes:</dt>
            <dd className="col-span-2 text-slate-900 whitespace-pre-wrap">{quote.notes || '-'}</dd>
          </dl>
        </div>

        <div className="bg-slate-800 text-white rounded-lg shadow-sm p-6 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex justify-between text-slate-300 text-lg">
              <span>Subtotal</span>
              <span>₱{Number(quote.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-lg">
              <span>Discount</span>
              <span>₱{Number(quote.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="h-px bg-slate-600 my-2"></div>
            <div className="flex justify-between text-3xl font-bold text-yellow-400">
              <span>Grand Total</span>
              <span>₱{Number(quote.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
