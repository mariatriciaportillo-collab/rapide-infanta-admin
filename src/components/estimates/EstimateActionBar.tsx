'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCircle2, Loader2, Plus, Printer } from 'lucide-react'
import { startJobEstimate } from '@/app/(dashboard)/estimates/[id]/actions'

export function EstimateActionBar({ estimateId, initialStatus }: { estimateId: string, initialStatus: string }) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  
  const isApproved = initialStatus === 'JOB STARTED' || initialStatus === 'APPROVED'

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
        <span className="hidden sm:inline">{isApproved ? 'Approved' : 'Approve'}</span>
      </button>

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
