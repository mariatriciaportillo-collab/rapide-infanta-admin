'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

export default function PaymentReceiptPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const supabase = createClient()
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          customers:customer_id(*),
          invoices:invoice_id(invoice_number, grand_total, balance_due, amount_paid),
          quick_sales:quick_sale_id(quick_sale_number, grand_total)
        `)
        .eq('id', id)
        .single()
      if (data) setPayment(data)
      setLoading(false)
    }
    load()
  }, [id, supabase])

  useEffect(() => {
    if (!loading && payment) {
      setTimeout(() => window.print(), 500)
    }
  }, [loading, payment])

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (!payment) return <div className="p-6 text-center text-red-500">Not found</div>

  const isCompany = payment.customers?.customer_type?.toLowerCase() === 'company'
  const customerName = isCompany ? payment.customers?.company_name : `${payment.customers?.first_name} ${payment.customers?.last_name}`

  // Compute what the previous balance was (rough estimate since we might have multiple payments)
  // Actually, we just show Invoice details.
  const inv = payment.invoices
  const qs = payment.quick_sales
  const docType = inv ? 'Invoice' : qs ? 'Quick Sale' : 'None'
  const docNumber = inv ? inv.invoice_number : qs ? qs.quick_sale_number : '-'
  const docTotal = inv ? inv.grand_total : qs ? qs.grand_total : 0
  const currentBalance = inv ? inv.balance_due : 0 // For quick sale it's usually fully paid

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
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Payment Receipt</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-slate-500 font-medium">Receipt No:</div>
            <div className="font-bold text-slate-900">{payment.receipt_number}</div>
            <div className="text-slate-500 font-medium">Date/Time:</div>
            <div className="font-bold text-slate-900">{format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}</div>
          </div>
        </div>
      </div>

      {/* Top Information Summary */}
      <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
        <div className="p-4 pl-8">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Customer</h3>
          <div className="text-slate-800 text-sm leading-snug">
            <div className="font-bold text-base">{customerName}</div>
            {payment.customers?.telephone && <div className="text-slate-600 mt-0.5">{payment.customers.telephone}</div>}
          </div>
        </div>
        
        <div className="p-4 pr-8 pl-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Reference Document</h3>
          <div className="text-slate-800 text-sm space-y-1">
            <div className="flex gap-2 items-center">
              <span className="text-slate-500 font-medium w-16">{docType}:</span>
              <span className="font-bold">{docNumber}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-slate-500 font-medium w-16">Doc Total:</span>
              <span className="font-medium">₱{Number(docTotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="px-8 pt-8 pb-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-lg mx-auto space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Payment Method:</span>
            <span className="font-bold text-slate-800">{payment.payment_method}</span>
          </div>
          {payment.reference_number && payment.reference_number !== 'N/A' && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Ref No:</span>
              <span className="font-bold text-slate-800">{payment.reference_number}</span>
            </div>
          )}
          
          <div className="h-px bg-slate-200 my-2"></div>
          
          <div className="flex justify-between items-center text-lg">
            <span className="text-slate-600 font-bold uppercase tracking-wider text-xs">Amount Paid</span>
            <span className="text-2xl font-bold text-emerald-600">₱{Number(payment.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          
          {inv && (
            <>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Remaining Balance (As of printing):</span>
                <span className="font-bold text-slate-800">₱{Number(currentBalance).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer / Signatures */}
      <div className="mt-12 px-8 flex flex-col items-center gap-4 page-break-inside-avoid pb-4">
        <div className="flex flex-col text-center w-full max-w-[250px]">
          <div className="border-b border-slate-800 mb-0.5 h-6"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase truncate leading-tight">{payment.received_by}</p>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">RECEIVED BY</p>
        </div>
        <p className="text-[9px] text-slate-400 italic mt-4 text-center max-w-sm">
          This document serves as proof of payment. Thank you for choosing Rapidé!
        </p>
      </div>
    </div>
  )
}
