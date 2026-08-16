'use client'

import { createClient } from '@/utils/supabase/client'
import { use, useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function PrintQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: q, error: qErr } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (qErr || !q) {
        setLoading(false)
        return
      }

      const { data: itms } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .order('sort_order', { ascending: true })

      setQuote(q)
      setItems(itms || [])
      setLoading(false)

      // Automatically trigger print when data loads
      setTimeout(() => {
        window.print()
      }, 500)
    }
    
    loadData()
  }, [id, supabase])

  if (loading) return <div className="p-12 text-center text-slate-500">Loading quotation for printing...</div>
  if (!quote) return notFound()

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Non-printable back button */}
      <div className="print:hidden p-4 bg-slate-100 border-b flex justify-between items-center mb-8">
        <p className="text-slate-600 text-sm font-medium">Use Cmd+P or Ctrl+P to print if the dialog didn't open.</p>
        <button 
          onClick={() => router.back()}
          className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 transition font-medium text-sm"
        >
          Back to Quotation
        </button>
      </div>

      {/* A4 Print Container */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              RAPIDÉ <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block -translate-y-3"></span>
            </h1>
            <p className="font-semibold uppercase tracking-widest text-slate-500 mt-1">Infanta Branch</p>
            <div className="mt-4 text-sm text-slate-600 space-y-1">
              <p>National Highway, Brgy. Comon</p>
              <p>Infanta, Quezon 4336</p>
              <p>Mobile: +63 917 123 4567</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Quotation</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-semibold text-slate-700">Quote No:</span> {quote.quote_number}</p>
              <p><span className="font-semibold text-slate-700">Date:</span> {format(new Date(quote.created_at), 'MMM d, yyyy')}</p>
              <p><span className="font-semibold text-slate-700">Status:</span> {quote.status}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h3 className="font-bold text-slate-800 uppercase border-b border-slate-300 pb-1 mb-2">Billed To</h3>
            <p className="font-semibold text-slate-900 text-base">{quote.customer_name}</p>
            {quote.customer_address && <p className="text-slate-600 mt-1">{quote.customer_address}</p>}
            {quote.customer_email && <p className="text-slate-600 mt-1">{quote.customer_email}</p>}
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 uppercase border-b border-slate-300 pb-1 mb-2">Vehicle Details</h3>
            <table className="w-full text-slate-700">
              <tbody>
                <tr>
                  <td className="py-1 font-medium w-24">Plate No:</td>
                  <td className="py-1 uppercase font-bold">{quote.vehicle_plate}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Make/Model:</td>
                  <td className="py-1">{quote.vehicle_make} {quote.vehicle_model} {quote.vehicle_year}</td>
                </tr>
                <tr>
                  <td className="py-1 font-medium">Mileage:</td>
                  <td className="py-1">{quote.mileage_km ? `${quote.mileage_km} km` : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-left text-sm text-slate-700 mb-8 border-collapse">
          <thead className="border-y-2 border-slate-900">
            <tr>
              <th className="py-3 px-2 font-bold uppercase w-12 text-center">Qty</th>
              <th className="py-3 px-2 font-bold uppercase">Description</th>
              <th className="py-3 px-2 font-bold uppercase text-right w-32">Unit Price</th>
              <th className="py-3 px-2 font-bold uppercase text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              item.is_section_header ? (
                <tr key={item.id} className="bg-slate-50 border-y border-slate-300">
                  <td colSpan={4} className="py-2 px-2 font-bold text-slate-900 uppercase">
                    {item.description}
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td className="py-2 px-2 text-center align-top">{item.quantity}</td>
                  <td className="py-2 px-2 align-top">{item.description}</td>
                  <td className="py-2 px-2 text-right align-top">₱{Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-2 px-2 text-right align-top font-medium text-slate-900">₱{Number(item.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>

        {/* Totals & Notes */}
        <div className="grid grid-cols-2 gap-8">
          <div className="text-sm">
            {quote.notes && (
              <div className="mb-4">
                <h3 className="font-bold text-slate-800 uppercase pb-1 mb-1">Notes</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
            {quote.warranty_terms && (
              <div>
                <h3 className="font-bold text-slate-800 uppercase pb-1 mb-1">Warranty</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{quote.warranty_terms}</p>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 p-6 border border-slate-200 rounded-md">
            <table className="w-full text-right text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-600 font-medium">Subtotal:</td>
                  <td className="py-1 font-medium text-slate-900">₱{Number(quote.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-600 font-medium pb-4">Discount:</td>
                  <td className="py-1 font-medium text-red-600 pb-4">- ₱{Number(quote.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                <tr className="border-t-2 border-slate-900">
                  <td className="py-4 text-base font-bold text-slate-900 uppercase">Grand Total:</td>
                  <td className="py-4 text-xl font-bold text-slate-900">₱{Number(quote.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-20 text-sm">
          <div className="text-center">
            <div className="border-b border-slate-400 mb-2 w-full pt-8"></div>
            <p className="font-bold text-slate-800 uppercase">{quote.prepared_by || 'Prepared By'}</p>
            <p className="text-slate-500 text-xs mt-1">Authorized Representative</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 mb-2 w-full pt-8"></div>
            <p className="font-bold text-slate-800 uppercase">{quote.customer_name}</p>
            <p className="text-slate-500 text-xs mt-1">Customer Signature over Printed Name</p>
          </div>
        </div>

      </div>
    </div>
  )
}
