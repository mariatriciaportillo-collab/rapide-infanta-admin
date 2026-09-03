'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { approveQuotation } from '@/app/(dashboard)/quotations/[id]/actions'

export function ApproveQuotationButton({ quotationId, initialStatus, initialEstimateId }: { quotationId: string, initialStatus: string, initialEstimateId?: string }) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  
  const isApproved = initialStatus === 'APPROVED'

  const handleApprove = async () => {
    if (isApproved && initialEstimateId) {
      router.push(`/estimate/${initialEstimateId}`)
      return
    }

    try {
      setIsApproving(true)
      const res = await approveQuotation(quotationId)
      if (res.success) {
        router.push(`/estimate/${res.estimateId}`)
      }
    } catch (e: any) {
      alert(e.message)
      setIsApproving(false)
    }
  }

  if (isApproved) {
    return (
      <button 
        onClick={handleApprove}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
      >
        <ArrowRight size={18} />
        View Estimate
      </button>
    )
  }

  return (
    <button 
      onClick={handleApprove}
      disabled={isApproving}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm"
    >
      {isApproving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
      Mark Approved
    </button>
  )
}
