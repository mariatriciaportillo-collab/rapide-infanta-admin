import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CustomerTabs } from '@/components/customers/CustomerTabs'
import { Suspense } from 'react'

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const supabase = await createClient()

  // 1. Fetch Customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
    
  if (customerError || !customer) {
    notFound()
  }

  // 2. Fetch Vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  // 3. Fetch Estimates (Replaces Quotations tab conceptually)
  const { data: estimates } = await supabase
    .from('estimates')
    .select('*, vehicles(plate_number, make, model)')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  // 4. Fetch Service History (Invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, vehicles(plate_number, make, model), invoice_items(description)')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })
    
  // 5. Fetch Quick Sales
  const { data: quickSales } = await supabase
    .from('quick_sales')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  const isCompany = customer.customer_type === 'company'
  const displayName = customer.customer_type === 'company' && customer.name
    ? customer.name
    : [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Unnamed Customer'

  return (
    <div className="pb-24 max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/customers" className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-bold text-slate-800">
          {displayName}
        </h2>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading details...</div>}>
        <CustomerTabs 
        customer={customer}
        vehicles={vehicles || []}
        estimates={estimates || []}
        invoices={invoices || []}
        quickSales={quickSales || []}
      />
      </Suspense>
    </div>
  )
}
