'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startJobEstimate(estimateId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('estimates')
    .update({ status: 'JOB STARTED' })
    .eq('id', estimateId)

  if (error) {
    throw new Error('Failed to start job: ' + error.message)
  }

  revalidatePath(`/estimates/${estimateId}`)
  
  return { success: true }
}


export async function createInvoiceFromEstimate(estimateId: string) {
  const supabase = await createClient()

  // 1. Fetch estimate & items
  const { data: estimate, error: estErr } = await supabase
    .from('estimates')
    .select('*, estimate_items(*)')
    .eq('id', estimateId)
    .single()

  if (estErr || !estimate) throw new Error('Estimate not found')
  if (estimate.status !== 'JOB STARTED' && estimate.status !== 'APPROVED' && estimate.status !== 'COMPLETED') {
    throw new Error('Estimate must be Approved / Job Started to complete.')
  }

  // 2. Check existing
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('estimate_id', estimateId)
    .single()

  if (existing) {
    // Already created, update estimate just in case
    await supabase.from('estimates').update({ status: 'COMPLETED' }).eq('id', estimateId)
    return { success: true, invoiceId: existing.id }
  }

  // 3. Generate Number
  const { data: latest } = await supabase
    .from('invoices')
    .select('invoice_number')
    .ilike('invoice_number', 'INV-%')
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single()

  let nextSeq = 1
  if (latest && latest.invoice_number) {
    const match = latest.invoice_number.match(/INV-(\d+)/)
    if (match) nextSeq = parseInt(match[1]) + 1
  }
  const invNumber = `INV-${nextSeq.toString().padStart(6, '0')}`

  // 4. Insert Invoice
  const { data: inv, error: invErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invNumber,
      estimate_id: estimate.id,
      customer_id: estimate.customer_id,
      vehicle_id: estimate.vehicle_id,
      status: 'UNPAID',
      subtotal: estimate.subtotal,
      discount_amount: estimate.discount_amount,
      grand_total: estimate.grand_total,
      amount_paid: 0,
      balance_due: estimate.grand_total,
      inventory_deducted: false,
      prepared_by: estimate.prepared_by,
      notes: estimate.notes
    })
    .select()
    .single()

  if (invErr) throw new Error(invErr.message)


  // 5. Insert Items (With Parent UUID Mapping)
  const idMap = new Map()
  for (const item of estimate.estimate_items) {
    idMap.set(item.id, crypto.randomUUID())
  }

  const newItems = estimate.estimate_items.map((i: any) => ({
    id: idMap.get(i.id),
    invoice_id: inv.id,
    item_type: i.item_type,
    package_id: i.package_id,
    labor_service_id: i.labor_service_id,
    part_id: i.part_id, // Final replacement part is carried over accurately
    parent_item_id: i.parent_item_id ? idMap.get(i.parent_item_id) : null,
    is_section_header: i.is_section_header,
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total_price: i.total_price,
    sort_order: i.sort_order
  }))


  const { error: itemsErr } = await supabase.from('invoice_items').insert(newItems)
  if (itemsErr) throw new Error(itemsErr.message)

  // 6. Update Estimate
  const { error: updateErr } = await supabase
    .from('estimates')
    .update({ status: 'COMPLETED' })
    .eq('id', estimateId)

  if (updateErr) throw new Error(updateErr.message)

  return { success: true, invoiceId: inv.id }
}
