import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EstimateForm } from '@/components/estimates/EstimateForm'

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const { data: estimate, error } = await supabase
    .from('estimates')
    .select(`
      *,
      customers(*),
      vehicles(*),
      estimate_items(*)
    `)
    .eq('id', id)
    .single()

  const status = (estimate.status || '').toUpperCase()
  const hasDownpayment = estimate.downpayment_amount > 0 || (estimate.payments && estimate.payments.length > 0)
  const isConverted = estimate.is_converted || estimate.invoice_id || status === 'CONVERTED'
  const isCompleted = status === 'COMPLETED'
  const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED'

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Estimate Locked</h2>
        <p className="text-slate-600 mb-6">
          {hasDownpayment 
            ? "This estimate cannot be edited because a downpayment has been received." 
            : isConverted 
              ? "This estimate cannot be edited because it has already been converted."
              : "This estimate is locked and cannot be edited."}
        </p>
        <a href={`/estimate/${id}`} className="bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-700 font-medium">
          Return to View
        </a>
      </div>
    )
  }


  if (error || !estimate) {
    notFound()
  }

  return <EstimateForm initialData={estimate} />
}
