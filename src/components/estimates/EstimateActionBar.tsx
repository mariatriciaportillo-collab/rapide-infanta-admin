'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCircle2, Loader2, Plus, Printer } from 'lucide-react'
import { startJobEstimate, createInvoiceFromEstimate } from '@/app/(dashboard)/estimates/[id]/actions'
import { FileText } from 'lucide-react'

export function EstimateActionBar({ estimateId, initialStatus }: { estimateId: string, initialStatus: string }) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  
  const isApproved = initialStatus === 'JOB STARTED' || initialStatus === 'APPROVED'


  const [isCompleting, setIsCompleting] = useState(false)
  
  const handleCompleteJob = async () => {
    if (!confirm('Complete this job?\n\nThis will mark the Estimate as completed and create the customer\'s Invoice/Billing Statement. The Estimate will remain locked.')) {
      return
    }

    try {
      setIsCompleting(true)
      const res = await createInvoiceFromEstimate(estimateId)
      if (res.success && res.invoiceId) {
        router.push(`/invoice/${res.invoiceId}`)
      }
    } catch (e: any) {
      alert(e.message)
      setIsCompleting(false)
    }
  }

  const handleApprove = async () => {
    if (isApproved) {
      return
    }

    if (!confirm('Start this job?\n\nApproving this Estimate means the customer has confirmed the work and the Estimate will be locked from further editing.')) {
      return
    }

    try {
      setIsApproving(true)
      const res = await startJobEstimate(estimateId)
      if (res.success) {
        router.refresh()
      }
    } catch (e: any) {
      alert(e.message)
      setIsApproving(false)
    }
  }

  return (
    <div className="flex items-center border border-slate-300 rounded-md shadow-sm overflow-hidden bg-white">
      <Link 
        href="/estimates/new"
        className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 transition border-r border-slate-200 text-slate-700 font-medium text-sm gap-2"
        title="New Estimate"
      >
        <Plus size={16} /> <span className="hidden sm:inline">New</span>
      </Link>

      <button 
        onClick={handleApprove}
        disabled={isApproving || isApproved}
        className={`flex items-center justify-center px-4 py-2 transition border-r border-slate-200 font-medium text-sm gap-2
          ${isApproved ? 'bg-green-50 text-green-700 cursor-default' : 'hover:bg-slate-50 text-slate-700'}`}
        title={isApproved ? "Job Started" : "Start Job"}
      >
        {isApproving ? <Loader2 size={16} className="animate-spin" /> : (isApproved ? <CheckCircle2 size={16} /> : <Check size={16} />)}
        <span className="hidden sm:inline">{isApproved ? 'Job Started' : 'Approve'}</span>
      </button>

      {/* Complete Job Button */}
      {(initialStatus === 'APPROVED' || initialStatus === 'JOB STARTED') && (
        <button 
          onClick={handleCompleteJob}
          disabled={isCompleting}
          className="flex items-center justify-center px-4 py-2 hover:bg-emerald-50 text-emerald-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          title="Complete Job"
        >
          {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          <span className="hidden sm:inline">Complete Job</span>
        </button>
      )}

      {/* View Invoice Button */}
      {initialStatus === 'COMPLETED' && (
        <button 
          onClick={handleCompleteJob} // It checks existing in action and returns invoiceId
          disabled={isCompleting}
          className="flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white transition border-r border-slate-200 font-medium text-sm gap-2"
          title="View Invoice"
        >
          {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          <span className="hidden sm:inline">View Invoice</span>
        </button>
      )}
      
      {initialStatus === 'COMPLETED' && (
        <div className="flex items-center justify-center px-4 py-2 bg-slate-50 text-slate-500 border-r border-slate-200 font-medium text-sm gap-2">
          <CheckCircle2 size={16} />
          <span className="hidden sm:inline">Completed</span>
        </div>
      )}

      <Link 
        href={`/estimates/${estimateId}/print`}
        target="_blank"
        className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 transition text-slate-700 font-medium text-sm gap-2"
        title="Print"
      >
        <Printer size={16} /> <span className="hidden sm:inline">Print</span>
      </Link>
    </div>
  )
}
