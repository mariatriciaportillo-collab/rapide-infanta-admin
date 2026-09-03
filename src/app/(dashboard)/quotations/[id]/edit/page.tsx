import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { QuotationForm } from '@/components/quotations/QuotationForm'

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const { data: quote, error } = await supabase
    .from('quotations')
    .select(`
      *,
      customers(*),
      vehicles(*),
      quotation_items(*)
    `)
    .eq('id', id)
    .single()

  const status = (quote.status || '').toUpperCase()
  const hasDownpayment = quote.downpayment_amount > 0 || (quote.payments && quote.payments.length > 0)
  const isConverted = quote.is_converted || quote.invoice_id || status === 'CONVERTED'
  const isCompleted = status === 'COMPLETED'
  const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED'

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quotation Locked</h2>
        <p className="text-slate-600 mb-6">
          {hasDownpayment 
            ? "This quotation cannot be edited because a downpayment has been received." 
            : isConverted 
              ? "This quotation cannot be edited because it has already been converted."
              : "This quotation is locked and cannot be edited."}
        </p>
        <a href={`/quotations/${id}`} className="bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-700 font-medium">
          Return to View
        </a>
      </div>
    )
  }


  if (error || !quote) {
    notFound()
  }
  
  if (quote.status === 'APPROVED') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quotation Locked</h2>
        <p>This quotation has been approved and converted to an Estimate. It can no longer be edited.</p>
      </div>
    )
  }

  return <QuotationForm initialData={quote} />
}
