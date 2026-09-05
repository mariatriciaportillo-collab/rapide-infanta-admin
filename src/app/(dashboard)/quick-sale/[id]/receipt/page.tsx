import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { PaymentReceipt } from '@/components/payments/PaymentReceipt'

export default async function QuickSaleReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sale, error } = await supabase
    .from('quick_sales')
    .select(`
      *,
      customers:customer_id(*),
      vehicles:vehicle_id(*)
    `)
    .eq('id', id)
    .single()

  if (error || !sale) notFound()

  const { data: payments } = await supabase.from('payments').select('*').eq('quick_sale_id', sale.id).order('created_at', { ascending: true });
  const validPayments = (payments || []).filter(p => Number(p.amount_paid) > 0);

  const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const balanceDue = Math.max(0, Number(sale.grand_total) - totalPaid);
  let status = 'UNPAID';
  if (balanceDue <= 0) status = 'PAID';
  else if (totalPaid > 0) status = 'PARTIALLY PAID';

  const customerName = sale.customers 
    ? (sale.customers.customer_type?.toLowerCase() === 'company' ? sale.customers.company_name : `${sale.customers.first_name} ${sale.customers.last_name}`).trim()
    : 'Unknown Customer'
    
  const vehicleInfo = sale.vehicles 
    ? `${sale.vehicles.make} ${sale.vehicles.model} - ${sale.vehicles.plate_number}`
    : ''

  return (
    <PaymentReceipt 
      documentNo={sale.quick_sale_number}
      documentType="Quick Sale"
      customerName={customerName}
      vehicleInfo={vehicleInfo}
      grandTotal={Number(sale.grand_total)}
      totalPaid={totalPaid}
      balanceDue={balanceDue}
      status={status}
      payments={validPayments}
    />
  )
}
