'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveQuotation(quotationId: string) {
  const supabase = await createClient()

  // 1. Check if an estimate already exists
  const { data: existing } = await supabase
    .from('estimates')
    .select('id')
    .eq('quotation_id', quotationId)
    .single()

  if (existing) {
    return { success: true, estimateId: existing.id }
  }

  // 2. Fetch the quotation
  const { data: quote, error: quoteErr } = await supabase
    .from('quotations')
    .select('*, quotation_items(*)')
    .eq('id', quotationId)
    .single()

  if (quoteErr || !quote) {
    throw new Error('Failed to fetch quotation')
  }

  // 3. Mark approved
  await supabase
    .from('quotations')
    .update({ status: 'APPROVED' })
    .eq('id', quotationId)

  // 4. Generate new estimate number
  let nextNumber = 1
  const { data: latestEstimate } = await supabase
    .from('estimates')
    .select('estimate_number')
    .ilike('estimate_number', 'EST-%')
    .order('estimate_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestEstimate && latestEstimate.estimate_number) {
    const match = latestEstimate.estimate_number.match(/EST-(\d+)/)
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }
  const estimateNumber = `EST-${nextNumber.toString().padStart(5, '0')}`

  // 5. Create the estimate
  const estimatePayload = {
    estimate_number: estimateNumber,
    quotation_id: quotationId, // The new column we will ask the user to add!
    customer_id: quote.customer_id,
    vehicle_id: quote.vehicle_id,
    customer_type: quote.customer_type,
    customer_name: quote.customer_name,
    contact_person: quote.contact_person,
    customer_email: quote.customer_email,
    customer_telephone: quote.customer_telephone,
    customer_tin: quote.customer_tin,
    customer_address: quote.customer_address,
    vehicle_plate: quote.vehicle_plate,
    vehicle_make: quote.vehicle_make,
    vehicle_model: quote.vehicle_model,
    vehicle_year: quote.vehicle_year,
    mileage_km: quote.mileage_km,
    status: 'draft',
    prepared_by: quote.prepared_by, // Will retain who originally prepared it or maybe the user approving? We'll leave original for now.
    service_advisor_id: quote.service_advisor_id,
    service_advisor_name: quote.service_advisor_name,
    mechanic_id: quote.mechanic_id,
    mechanic_name: quote.mechanic_name,
    notes: quote.notes,
    subtotal: quote.subtotal,
    discount_amount: quote.discount_amount,
    grand_total: quote.grand_total,
  }

  const { data: newEstimate, error: estErr } = await supabase
    .from('estimates')
    .insert(estimatePayload)
    .select('id')
    .single()

  if (estErr) {
    throw new Error('Failed to create estimate: ' + estErr.message)
  }

  // 6. Create estimate items
  if (quote.quotation_items && quote.quotation_items.length > 0) {
    // Generate new UUIDs for the items and map parent relationships
    const idMap = new Map<string, string>()
    quote.quotation_items.forEach((item: any) => {
      idMap.set(item.id, crypto.randomUUID())
    })

    const itemsToInsert = quote.quotation_items.map((item: any) => ({
      id: idMap.get(item.id),
      estimate_id: newEstimate.id,
      sort_order: item.sort_order,
      item_type: item.item_type,
      package_id: item.package_id,
      labor_service_id: item.labor_service_id,
      part_id: item.part_id,
      parent_item_id: item.parent_item_id ? idMap.get(item.parent_item_id) : null,
      is_section_header: item.is_section_header,
      is_category: item.is_category,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      category_id: item.category_id,
      group_name_snapshot: item.group_name_snapshot,
      category_name_snapshot: item.category_name_snapshot,
      standard_hour_snapshot: item.standard_hour_snapshot,
    }))

    const { error: itemsErr } = await supabase
      .from('estimate_items')
      .insert(itemsToInsert)

    if (itemsErr) {
      throw new Error('Failed to create estimate items: ' + itemsErr.message)
    }
  }

  revalidatePath(`/quotations/${quotationId}`)
  
  return { success: true, estimateId: newEstimate.id }
}
