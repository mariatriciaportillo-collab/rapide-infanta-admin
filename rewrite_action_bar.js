const fs = require('fs');
const path = 'src/components/estimates/EstimateActionBar.tsx';

const content = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCircle2, Loader2, Plus, Printer, FileText } from 'lucide-react'
import { startJobEstimate, createInvoiceFromEstimate } from '@/app/(dashboard)/estimates/[id]/actions'

export function EstimateActionBar({ estimateId, initialStatus }: { estimateId: string, initialStatus: string }) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  
  const handleApprove = async () => {
    if (!confirm('Start this job?\\n\\nApproving this Estimate means the customer has confirmed the work and the Estimate will be locked from further editing.')) {
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

  const handleCompleteJob = async () => {
    if (initialStatus !== 'COMPLETED' && !confirm('Complete this job?\\n\\nThis will mark the Estimate as completed and create the customer\\'s Billing Statement. The Estimate will remain locked.')) {
      return
    }
    try {
      setIsCompleting(true)
      const res = await createInvoiceFromEstimate(estimateId)
      if (res.success && res.invoiceId) {
        router.push(\`/invoice/\${res.invoiceId}\`)
      }
    } catch (e: any) {
      alert(e.message)
      setIsCompleting(false)
    }
  }

  const isDraft = !initialStatus || initialStatus === 'DRAFT'
  const isStarted = initialStatus === 'JOB STARTED' || initialStatus === 'APPROVED'
  const isCompleted = initialStatus === 'COMPLETED'

  return (
    <div className="flex items-center border border-slate-300 rounded-md shadow-sm overflow-hidden bg-white">
      {/* New */}
      <Link 
        href="/estimates/new"
        className="flex items-center justify-center px-3 py-1.5 hover:bg-slate-50 transition border-r border-slate-200 text-slate-700 font-medium text-sm gap-2"
        title="New Estimate"
      >
        <Plus size={16} /> <span className="hidden sm:inline">New</span>
      </Link>

      {/* View Billing Statement (Only for Completed) */}
      {isCompleted && (
        <button 
          onClick={handleCompleteJob}
          disabled={isCompleting}
          className="flex items-center justify-center px-3 py-1.5 hover:bg-slate-50 text-blue-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          title="View Billing Statement"
        >
          {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          <span className="hidden sm:inline">View Billing Statement</span>
        </button>
      )}

      {/* Approve (Only for Draft) */}
      {isDraft && (
        <button 
          onClick={handleApprove}
          disabled={isApproving}
          className="flex items-center justify-center px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          title="Approve Estimate"
        >
          {isApproving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          <span className="hidden sm:inline">Approve</span>
        </button>
      )}

      {/* Job Started Badge (Only for Started) */}
      {isStarted && (
        <div className="flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 border-r border-slate-200 font-medium text-sm gap-2 cursor-default">
          <CheckCircle2 size={16} />
          <span className="hidden sm:inline">Job Started</span>
        </div>
      )}

      {/* Complete Job (Only for Started) */}
      {isStarted && (
        <button 
          onClick={handleCompleteJob}
          disabled={isCompleting}
          className="flex items-center justify-center px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 transition border-r border-slate-200 font-medium text-sm gap-2"
          title="Complete Job"
        >
          {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          <span className="hidden sm:inline">Complete Job</span>
        </button>
      )}

      {/* Completed Badge (Only for Completed) */}
      {isCompleted && (
        <div className="flex items-center justify-center px-3 py-1.5 bg-slate-50 text-slate-500 border-r border-slate-200 font-medium text-sm gap-2 cursor-default">
          <CheckCircle2 size={16} />
          <span className="hidden sm:inline">Completed</span>
        </div>
      )}

      {/* Print */}
      <Link 
        href={\`/estimates/\${estimateId}/print\`}
        target="_blank"
        className="flex items-center justify-center px-3 py-1.5 hover:bg-slate-50 transition text-slate-700 font-medium text-sm gap-2"
        title="Print"
      >
        <Printer size={16} /> <span className="hidden sm:inline">Print</span>
      </Link>
    </div>
  )
}
`;
fs.writeFileSync(path, content);
