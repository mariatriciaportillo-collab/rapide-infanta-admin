import { SupabaseClient } from '@supabase/supabase-js'
import { buildLegacyName } from './customer'

export type CustomerTypeUI = 'individual' | 'company'

export interface SaveCustomerParams {
  id?: string // If present, it's an update
  customerType: CustomerTypeUI
  firstName: string
  lastName: string
  companyName: string
  contactFirstName: string
  contactLastName: string
  mobile: string
  telephone: string
  email: string
  address: string
  tin: string
  notes?: string
}

// Map UI state to Database canonical format
// If the DB constraint requires Title Case (e.g. 'Individual', 'Company'), change this map.
// Based on the codebase, we default to lowercase, which matches the TS types.
export function mapCustomerTypeForDb(uiType: CustomerTypeUI): string {
  // If the constraint is EXACTLY matching 'Individual' / 'Company', change to:
  // return uiType.charAt(0).toUpperCase() + uiType.slice(1);
  return uiType; 
}

export async function saveCustomerRecord(supabase: SupabaseClient, params: SaveCustomerParams) {
  const cleanFirstName = params.firstName?.trim() || ''
  const cleanLastName = params.lastName?.trim() || ''
  const cleanCompanyName = params.companyName?.trim() || ''
  const cleanContactFirst = params.contactFirstName?.trim() || ''
  const cleanContactLast = params.contactLastName?.trim() || ''

  const dbCustomerType = mapCustomerTypeForDb(params.customerType)
  
  const payload = {
    customer_type: dbCustomerType,
    name: buildLegacyName(params.customerType, cleanFirstName, cleanLastName, cleanCompanyName),
    first_name: params.customerType === 'individual' ? cleanFirstName || null : null,
    last_name: params.customerType === 'individual' ? cleanLastName || null : null,
    contact_first_name: params.customerType === 'company' ? cleanContactFirst || null : null,
    contact_last_name: params.customerType === 'company' ? cleanContactLast || null : null,
    mobile: params.mobile?.trim() || null,
    telephone: params.customerType === 'company' ? params.telephone?.trim() || null : null,
    email: params.email?.trim() || null,
    address: params.address?.trim() || null,
    tin: params.customerType === 'company' ? params.tin?.trim() || null : null,
    ...(params.notes !== undefined && { notes: params.notes.trim() || null })
  }

  if (params.id) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('customers')
      .insert([payload])
      .select()
      .single()
    return { data, error }
  }
}
