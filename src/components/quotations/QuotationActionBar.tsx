'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCircle2, Loader2, Plus, Printer } from 'lucide-react'
import { approveQuotation } from '@/app/(dashboard)/quotations/[id]/actions'

export function QuotationActionBar({ quotationId, initialStatus, initialEstimateId }: { quotationId: string, initialStatus: string, initialEstimateId?: string }) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  
  const isApproved = initialStatus === 'APPROVED'

  const handleApprove = async () => {
    if (isApproved && initialEstimateId) {
      router.push(`/estimates/${initialEstimateId}`)
      return
    }

    if (!confirm('Approve this quotation?\n\nThis means the customer has agreed to proceed and an Estimate will be created from this Quotation.')) {
      return
    }

    try {
      setIsApproving(true)
      const res = await approveQuotation(quotationId)
      if (res.success) {
        router.push(`/estimates/${res.estimateId}`)
      }
    } catch (e: any) {
      alert(e.message)
      setIsApproving(false)
    }
  }

  return (
    <div className="flex items-center border border-slate-300 rounded-md shadow-sm overflow-hidden bg-white">
      <Link 
        href="/quotations/new"
        className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 transition border-r border-slate-200 text-slate-700 font-medium text-sm gap-2"
        title="New Quotation"
      >
        <Plus size={16} /> <span className="hidden sm:inline">New</span>
      </Link>

      <button 
        onClick={handleApprove}
        disabled={isApproving}
        className={`flex items-center justify-center px-4 py-2 transition border-r border-slate-200 font-medium text-sm gap-2
          ${isApproved ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'hover:bg-slate-50 text-slate-700'}`}
        title={isApproved ? "Approved - View Estimate" : "Approve Quotation"}
      >
        {isApproving ? <Loader2 size={16} className="animate-spin" /> : (isApproved ? <CheckCircle2 size={16} /> : <Check size={16} />)}
        <span className="hidden sm:inline">{isApproved ? 'Approved' : 'Approve'}</span>
      </button>

      <Link 
        href={`/quotations/${quotationId}/print`}
        target="_blank"
        className="flex items-center justify-center px-4 py-2 hover:bg-slate-50 transition text-slate-700 font-medium text-sm gap-2"
        title="Print"
      >
        <Printer size={16} /> <span className="hidden sm:inline">Print</span>
      </Link>
    </div>
  )
}
