const fs = require('fs');

let file = fs.readFileSync('src/app/(dashboard)/customers/new/page.tsx', 'utf8');

const target = `    if (customerType === 'individual') {`;
const replacement = `
    const duplicate = await checkDuplicateCustomer(supabase, customerType, cleanFirstName, cleanLastName, cleanCompanyName)
    if (duplicate) {
      setError("Customer already exists. Please select the existing customer instead.")
      setIsSubmitting(false)
      return
    }
    
    if (customerType === 'individual') {`;

if (!file.includes('checkDuplicateCustomer(supabase')) {
  file = file.replace(target, replacement);
  fs.writeFileSync('src/app/(dashboard)/customers/new/page.tsx', file);
}
