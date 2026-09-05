import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { PaymentReceipt } from '@/components/payments/PaymentReceipt'

export default async function QuotationReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quote, error } = await supabase
    .from('quotations')
    .select(`
      *,
      customers:customer_id(*),
      vehicles:vehicle_id(*)
    `)
    .eq('id', id)
    .single()

  if (error || !quote) notFound()

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('quotation_id', quote.id)
    .order('created_at', { ascending: true })

  const validPayments = (payments || []).filter(p => Number(p.amount_paid) > 0)
  const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0)

  const customerName = quote.customers 
    ? (quote.customers.customer_type?.toLowerCase() === 'company' ? quote.customers.company_name : `${quote.customers.first_name} ${quote.customers.last_name}`).trim()
    : 'Unknown Customer'
    
  const vehicleInfo = quote.vehicles 
    ? `${quote.vehicles.make} ${quote.vehicles.model} - ${quote.vehicles.plate_number}`
    : ''

  return (
    <PaymentReceipt 
      documentNo={quote.quote_number}
      documentType="Quotation"
      customerName={customerName}
      vehicleInfo={vehicleInfo}
      grandTotal={Number(quote.grand_total)}
      totalPaid={totalPaid}
      balanceDue={0} 
      status={quote.downpayment_status || 'PENDING'}
      payments={validPayments}
    />
  )
}
