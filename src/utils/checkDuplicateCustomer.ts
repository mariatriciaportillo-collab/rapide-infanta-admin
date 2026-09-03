import { SupabaseClient } from '@supabase/supabase-js'

export async function checkDuplicateCustomer(
  supabase: SupabaseClient,
  type: 'individual' | 'company',
  firstName: string,
  lastName: string,
  companyName: string
) {
  if (type === 'individual') {
    const fn = firstName.trim().replace(/\s+/g, ' ')
    const ln = lastName.trim().replace(/\s+/g, ' ')
    
    // Use ilike for case-insensitive match
    const { data } = await supabase
      .from('customers')
      .select('id, first_name, last_name, customer_type')
      .eq('customer_type', 'individual')
      .ilike('first_name', fn)
      .ilike('last_name', ln)
      .limit(1)

    return data && data.length > 0 ? data[0] : null
  } else {
    const cn = companyName.trim().replace(/\s+/g, ' ')
    const { data } = await supabase
      .from('customers')
      .select('id, company_name, customer_type')
      .eq('customer_type', 'company')
      .ilike('company_name', cn)
      .limit(1)
      
    return data && data.length > 0 ? data[0] : null
  }
}
