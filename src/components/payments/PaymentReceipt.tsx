'use client'

import React from 'react'
import { Printer } from 'lucide-react'
import { format } from 'date-fns'

type PaymentHistory = {
  id: string
  created_at: string
  payment_type: string
  payment_method: string
  reference_number: string
  amount_paid: number
  received_by: string
  customer_receipt?: string
}

type ReceiptProps = {
  documentNo: string
  documentType: 'Billing Statement' | 'Quick Sale' | 'Quotation'
  customerName: string
  vehicleInfo: string
  grandTotal: number
  totalPaid: number
  balanceDue: number
  status: string
  payments: PaymentHistory[]
}

export function PaymentReceipt({
  documentNo,
  documentType,
  customerName,
  vehicleInfo,
  grandTotal,
  totalPaid,
  balanceDue,
  status,
  payments
}: ReceiptProps) {
  
  const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null
  const receiptNo = lastPayment?.customer_receipt || 'N/A'
  const receiptDate = lastPayment ? new Date(lastPayment.created_at) : new Date()
  const receivedBy = lastPayment?.received_by || 'Staff'
  
  const title = documentType === 'Quotation' ? 'DOWNPAYMENT RECEIPT' : 'PAYMENT RECEIPT'

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto flex justify-between mb-4 print:hidden">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-md font-medium transition"
        >
          ← Back
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition"
        >
          <Printer size={18} /> Print Receipt
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 p-8 rounded-lg print:w-full">
        
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-black text-red-600 tracking-tight uppercase">Rapidé Infanta</h1>
          <p className="text-xs font-bold text-slate-800 tracking-wider">OPERATED BY: MGP AUTO REPAIR CENTER</p>
          <p className="text-xs text-slate-600">PUROK 2, BRGY. MISWA INFANTA, QUEZON</p>
          <p className="text-xs text-slate-600">0920-416-4552</p>
          <h2 className="text-xl font-black text-slate-800 mt-4 tracking-widest uppercase">{title}</h2>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div>
            <div className="flex mb-1"><span className="w-32 font-bold text-slate-600">Receipt No.:</span> <span className="font-medium text-slate-900">{receiptNo}</span></div>
            <div className="flex mb-1"><span className="w-32 font-bold text-slate-600">Date:</span> <span className="font-medium text-slate-900">{format(receiptDate, 'MMM d, yyyy h:mm a')}</span></div>
            <div className="flex mb-1"><span className="w-32 font-bold text-slate-600">{documentType}:</span> <span className="font-bold text-slate-900">{documentNo}</span></div>
          </div>
          <div>
            <div className="flex mb-1"><span className="w-24 font-bold text-slate-600">Customer:</span> <span className="font-medium text-slate-900 uppercase">{customerName}</span></div>
            {vehicleInfo && (
              <div className="flex mb-1"><span className="w-24 font-bold text-slate-600">Vehicle:</span> <span className="font-medium text-slate-900 uppercase">{vehicleInfo}</span></div>
            )}
            <div className="flex mb-1">
              <span className="w-24 font-bold text-slate-600">Status:</span> 
              <span className="font-bold text-slate-900">{status}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {payments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Payment Details</h3>
            <table className="w-full text-xs text-left mb-4">
              <thead>
                <tr className="text-slate-500 font-bold uppercase">
                  <th className="py-1 border-b border-slate-200">Date</th>
                  <th className="py-1 border-b border-slate-200">Type</th>
                  <th className="py-1 border-b border-slate-200">Method</th>
                  <th className="py-1 border-b border-slate-200">Reference</th>
                  <th className="py-1 border-b border-slate-200 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="py-2 text-slate-700">{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                    <td className="py-2 text-slate-700 font-medium">{p.payment_type || 'PAYMENT'}</td>
                    <td className="py-2 text-slate-700">{p.payment_method}</td>
                    <td className="py-2 text-slate-700">{p.reference_number || '—'}</td>
                    <td className="py-2 text-right font-bold text-slate-900">₱{Number(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-between items-center bg-slate-50 p-3 border border-slate-200 rounded">
              <span className="font-bold text-slate-700 text-sm tracking-wider uppercase">Total Paid</span>
              <span className="font-black text-slate-900 text-lg">₱{Number(totalPaid).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-16 flex justify-between gap-16 page-break-inside-avoid">
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1 h-8 flex items-end justify-center">
              <span className="font-bold text-sm text-slate-800 uppercase">{receivedBy}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Received By</p>
          </div>
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1 h-8"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer's Signature</p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white; margin: 0; padding: 0; }
            @page { margin: 0.5in; }
          }
        `}} />
      </div>
    </div>
  )
}
