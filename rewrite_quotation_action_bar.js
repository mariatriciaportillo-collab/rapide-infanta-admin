const fs = require('fs');
const path = 'src/components/quotations/QuotationActionBar.tsx';

const content = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCircle2, Loader2, Plus, Printer, FileText, ArrowRight, DollarSign, X } from 'lucide-react'
import { approveQuotationWithConditions, createEstimateFromQuotation } from '@/app/(dashboard)/quotations/[id]/actions'

export function QuotationActionBar({ quote, initialEstimateId }: { quote: any, initialEstimateId?: string }) {
  const router = useRouter()
  
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [partsOrderRequired, setPartsOrderRequired] = useState<boolean | null>(null)
  const [vehicleStays, setVehicleStays] = useState<boolean | null>(null)
  const [requiredDownpayment, setRequiredDownpayment] = useState<string>('')
  
  const [isApproving, setIsApproving] = useState(false)
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false)
  
  const status = (quote.status || 'DRAFT').toUpperCase()
  const dpStatus = (quote.downpayment_status || 'NONE').toUpperCase()
  
  const isDraft = status === 'DRAFT'
  const isApproved = status === 'APPROVED'
  const isConverted = status === 'CONVERTED'
  
  const handleConfirmApprove = async () => {
    if (partsOrderRequired === null) return;
    if (partsOrderRequired === true && vehicleStays === null) return;
    
    let dpRequired = false;
    let dpAmount = 0;
    
    if (partsOrderRequired && !vehicleStays) {
      dpRequired = true;
      dpAmount = parseFloat(requiredDownpayment) || 0;
      if (dpAmount <= 0) {
        alert("Please enter a valid required downpayment amount.");
        return;
      }
    }
    
    try {
      setIsApproving(true)
      const conditions = {
        partsOrderRequired,
        vehicleStays,
        downpaymentRequired: dpRequired,
        requiredDownpaymentAmount: dpAmount
      }
      const res = await approveQuotationWithConditions(quote.id, conditions)
      if (res.success) {
        setShowApproveModal(false)
        router.refresh()
      }
    } catch (e: any) {
      alert(e.message)
      setIsApproving(false)
    }
  }

  const handleCreateEstimate = async () => {
    if (isConverted && initialEstimateId) {
      router.push(\`/estimates/\${initialEstimateId}\`)
      return
    }

    if (!confirm('Create Estimate?\\n\\nThis will officially start the job and create an active Estimate record.')) {
      return
    }

    try {
      setIsCreatingEstimate(true)
      const res = await createEstimateFromQuotation(quote.id)
      if (res.success && res.estimateId) {
        router.push(\`/estimates/\${res.estimateId}\`)
      }
    } catch (e: any) {
      alert(e.message)
      setIsCreatingEstimate(false)
    }
  }

  return (
    <>
      <div className="flex items-center border border-slate-300 rounded-md shadow-sm overflow-hidden bg-white">
        <Link 
          href="/quotations/new"
          className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 transition border-r border-slate-200 text-slate-700 font-medium text-sm gap-2"
          title="New Quotation"
        >
          <Plus size={16} /> <span className="hidden sm:inline">New</span>
        </Link>

        {isDraft ? (
          <button 
            onClick={() => setShowApproveModal(true)}
            className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 text-slate-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          >
            <Check size={16} /> <span className="hidden sm:inline">Approve</span>
          </button>
        ) : isConverted ? (
          <button 
            onClick={() => { if(initialEstimateId) router.push(\`/estimates/\${initialEstimateId}\`) }}
            className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 text-blue-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          >
            <FileText size={16} /> <span className="hidden sm:inline">View Estimate</span>
          </button>
        ) : (
          <>
            {/* It is Approved, what next? */}
            {dpStatus === 'REQUIRED' || dpStatus === 'PARTIAL' ? (
              <button 
                onClick={() => router.push(\`/payments/new?source=quotation&id=\${quote.id}\`)}
                className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 text-blue-700 transition border-r border-slate-200 font-medium text-sm gap-2"
              >
                <DollarSign size={16} /> <span className="hidden sm:inline">Collect Downpayment</span>
              </button>
            ) : (
              <button 
                onClick={handleCreateEstimate}
                disabled={isCreatingEstimate}
                className="flex items-center justify-center px-4 py-2 hover:bg-emerald-50 text-emerald-700 transition border-r border-slate-200 font-medium text-sm gap-2"
              >
                {isCreatingEstimate ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                <span className="hidden sm:inline">Create Estimate</span>
              </button>
            )}
            
            <div className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 border-r border-slate-200 font-medium text-sm gap-2 cursor-default">
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">
                {dpStatus === 'PAID' ? 'Downpayment Paid' : 'Approved'}
              </span>
            </div>
          </>
        )}

        <Link 
          href={\`/quotations/\${quote.id}/print\`}
          target="_blank"
          className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 transition text-slate-700 font-medium text-sm gap-2"
          title="Print"
        >
          <Printer size={16} /> <span className="hidden sm:inline">Print</span>
        </Link>
      </div>

      {/* APPROVAL MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                Approve Quotation
              </h2>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Parts need to be ordered?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={partsOrderRequired === false} onChange={() => { setPartsOrderRequired(false); setVehicleStays(null); setRequiredDownpayment(''); }} className="w-4 h-4 text-blue-600" />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={partsOrderRequired === true} onChange={() => setPartsOrderRequired(true)} className="w-4 h-4 text-blue-600" />
                    Yes
                  </label>
                </div>
              </div>

              {partsOrderRequired === true && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Will the vehicle stay at Rapidé while waiting?</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={vehicleStays === true} onChange={() => { setVehicleStays(true); setRequiredDownpayment(''); }} className="w-4 h-4 text-blue-600" />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={vehicleStays === false} onChange={() => setVehicleStays(false)} className="w-4 h-4 text-blue-600" />
                      No
                    </label>
                  </div>
                </div>
              )}

              {partsOrderRequired === true && vehicleStays === false && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Required Downpayment</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                    <input 
                      type="number" 
                      value={requiredDownpayment}
                      onChange={e => setRequiredDownpayment(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="5000"
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">A downpayment is required before the job can start.</p>
                </div>
              )}
              
              <div className="bg-slate-50 p-3 rounded text-sm text-center font-medium border border-slate-200">
                {partsOrderRequired === null ? 'Please answer to proceed.' :
                 partsOrderRequired === false ? 'No Downpayment Required' :
                 vehicleStays === null ? 'Please answer to proceed.' :
                 vehicleStays === true ? 'No Downpayment Required' :
                 'Downpayment Required'}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition">
                Cancel
              </button>
              <button 
                onClick={handleConfirmApprove} 
                disabled={partsOrderRequired === null || (partsOrderRequired === true && vehicleStays === null) || isApproving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
              >
                {isApproving && <Loader2 size={16} className="animate-spin" />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
`;

fs.writeFileSync(path, content);
