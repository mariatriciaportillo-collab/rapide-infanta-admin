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

  if (error || !quote) {
    notFound()
  }

  return <QuotationForm initialData={quote} />
}
