const fs = require('fs');

let content = fs.readFileSync('src/components/quick-sale/QuickSaleForm.tsx', 'utf8');

// Replace the contact_person line with contact_first_name and contact_last_name
content = content.replace(/contact_person: contactPerson,/g, 
  "contact_first_name: customerType === 'company' ? contactFirstName : null,\n        contact_last_name: customerType === 'company' ? contactLastName : null,");

fs.writeFileSync('src/components/quick-sale/QuickSaleForm.tsx', content);
console.log('Fixed QuickSaleForm.tsx');
