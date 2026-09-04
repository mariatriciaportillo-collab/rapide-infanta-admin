'use client'
import { TableActions, TableAction } from '@/components/ui/TableActions'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { X, Printer, Banknote } from 'lucide-react'
import { recordDownpayment } from '@/app/(dashboard)/quotations/[id]/actions'

export default function PaymentsList() {
  const supabase = createClient()
  const [tab, setTab] = useState('history') // 'downpayment' or 'history'
  const [downpayments, setDownpayments] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [payRef, setPayRef] = useState('N/A')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    
    // 1. Fetch pending Quotation downpayments
    const { data: qData } = await supabase
      .from('quotations')
      .select(`id, quote_number, created_at, grand_total, required_downpayment_amount, downpayment_paid_amount, downpayment_status, customers:customer_id(name, first_name, last_name, customer_type), vehicles:vehicle_id(make, model, plate_number), estimates(id, invoices(status)), payments(customer_receipt)`)
      .in('status', ['APPROVED', 'CONVERTED'])
      .eq('downpayment_required', true)
      .order('created_at', { ascending: false })
      
    const activeQs = (qData || []).filter(q => {
      if (q.estimates) {
        const ests = Array.isArray(q.estimates) ? q.estimates : [q.estimates];
        for (const est of ests) {
          if (est.invoices) {
            const invs = Array.isArray(est.invoices) ? est.invoices : [est.invoices];
            for (const inv of invs) {
              if (inv.status === 'PAID') return false; // Fully paid final invoice, remove from Downpayment tab
            }
          }
        }
      }
      return true;
    });
    setDownpayments(activeQs);

    // 2. Fetch Payment History
    const { data: payData } = await supabase
      .from('payments')
      .select(`
        *,
        customers:customer_id(name, first_name, last_name, customer_type),
        invoices:invoice_id(invoice_number),
        quick_sales:quick_sale_id(quick_sale_number),
        quotations:quotation_id(quote_number)
      `)
      .neq('payment_type', 'DOWNPAYMENT')
      .order('created_at', { ascending: false })
      .limit(50)
      
    setHistory(payData || [])
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [supabase])

  const formatCustomerName = (c: any) => {
    if (!c) return 'Unknown'
    if (c.customer_type === 'company') return c.name
    return c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()
  }

  const handleOpenModal = (q: any) => {
    setSelectedQuote(q)
    setPayAmount(Number(q.required_downpayment_amount - (q.downpayment_paid_amount || 0)).toString())
    setPayMethod('CASH')
    setPayRef('N/A')
    setShowModal(true)
  }

  const handleSubmitDownpayment = async () => {
    if (!selectedQuote) return
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return alert('Invalid amount')
    
    setIsSubmitting(true)
    try {
      await recordDownpayment(selectedQuote.id, amount, payMethod, payRef)
      setShowModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-slate-500">Manage downpayments and view payment history</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setTab('history')}
          className={`pb-2 px-2 font-medium text-sm transition ${tab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Payment History
        </button>
        <button 
          onClick={() => setTab('downpayment')}
          className={`pb-2 px-2 font-medium text-sm transition ${tab === 'downpayment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Downpayment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {tab === 'downpayment' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Quotation</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Vehicle</th>
                  <th className="px-4 py-3 font-semibold text-right">Quotation Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Required Downpayment</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                  <th className="px-4 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : downpayments.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No pending downpayments</td></tr>
                ) : (
                  downpayments.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                        <Link href={`/quotations/${q.id}`}>{q.quote_number}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{formatCustomerName(q.customers)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {q.vehicles ? `${q.vehicles.make} ${q.vehicles.model} - ${q.vehicles.plate_number}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">₱{Number(q.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">₱{Number(q.required_downpayment_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">₱{Number(q.downpayment_paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? 'PAID' : (q.downpayment_status || 'PENDING')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          {(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? (
                            <TableAction icon={Printer} label="Print Downpayment Receipt" href={`/quotations/${q.id}/receipt`} />
                          ) : (
                            <TableAction icon={Banknote} label="Record Downpayment" onClick={() => handleOpenModal(q)} variant="success" />
                          )}
                        </TableActions>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt No.</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Ref. Document</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No payments found</td></tr>
                ) : (
                  history.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {p.customer_receipt || 'PENDING'}
                        <span className="block text-[10px] text-slate-400 font-normal">Internal: {p.receipt_number}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-slate-800">{formatCustomerName(p.customers)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.invoices ? (
                          <Link href={`/invoice/${p.invoice_id}`} className="hover:underline">{p.invoices.invoice_number}</Link>
                        ) : p.quick_sales ? (
                          <Link href={`/quick-sale/${p.quick_sale_id}`} className="hover:underline">{p.quick_sales.quick_sale_number}</Link>
                        ) : p.quotations ? (
                          <Link href={`/quotations/${p.quotation_id}`} className="hover:underline">{p.quotations.quote_number}</Link>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {p.payment_method}
                        {p.reference_number && p.reference_number !== 'N/A' && <span className="block text-slate-400">Ref: {p.reference_number}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₱{Number(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {p.invoices ? (
                          <Link href={`/invoice/${p.invoice_id}/receipt`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print</Link>
                        ) : p.quick_sales ? (
                          <Link href={`/quick-sale/${p.quick_sale_id}/receipt`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print</Link>
                        ) : p.quotation_id ? (
                          <Link href={`/quotations/${p.quotation_id}/receipt`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print</Link>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Downpayment Modal */}
      {showModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Record Downpayment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-sm space-y-1 mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Quotation No:</span> <span className="font-medium text-slate-900">{selectedQuote.quote_number}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Customer:</span> <span className="font-medium text-slate-900">{formatCustomerName(selectedQuote.customers)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Quotation Total:</span> <span className="font-medium text-slate-900">₱{Number(selectedQuote.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></div>
              </div>

              <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm mb-4 border border-amber-100 flex justify-between">
                <span className="font-medium">Required Downpayment:</span>
                <span className="font-bold">₱{Number(selectedQuote.required_downpayment_amount - (selectedQuote.downpayment_paid_amount || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount to Pay (₱)</label>
                <input 
                  type="number" 
                  value={payAmount} 
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
                <select 
                  value={payMethod} 
                  onChange={e => { setPayMethod(e.target.value); if(e.target.value==='CASH') setPayRef('N/A'); else setPayRef(''); }}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="GCASH">GCash</option>
                  <option value="MAYA">Maya</option>
                  <option value="BANK TRANSFER">Bank Transfer</option>
                  <option value="DEBIT CARD">Debit Card</option>
                  <option value="CREDIT CARD">Credit Card</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reference Number</label>
                <input 
                  type="text" 
                  value={payRef} 
                  onChange={e => setPayRef(e.target.value)}
                  disabled={payMethod === 'CASH'}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder={payMethod === 'CASH' ? 'N/A' : 'Transaction ID, Check No., etc.'}
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isSubmitting || !payAmount || Number(payAmount) <= 0 || (payMethod !== 'CASH' && !payRef.trim())}
                onClick={handleSubmitDownpayment}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Downpayment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
