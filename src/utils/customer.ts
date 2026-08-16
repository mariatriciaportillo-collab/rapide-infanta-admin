export function formatCustomerName(customer: any): string {
  if (!customer) return 'Unknown'
  
  if (customer.customer_type === 'individual') {
    if (customer.first_name && customer.last_name) {
      return `${customer.first_name} ${customer.last_name}`
    }
    // Fallback for legacy individuals
    return customer.name || 'Unknown'
  }
  
  // For companies
  return customer.name || 'Unknown'
}

export function formatContactPerson(customer: any): string {
  if (!customer) return ''
  
  if (customer.customer_type === 'company') {
    if (customer.contact_first_name && customer.contact_last_name) {
      return `${customer.contact_first_name} ${customer.contact_last_name}`
    }
    // Fallback for legacy companies
    return customer.contact_person || ''
  }
  
  return ''
}
