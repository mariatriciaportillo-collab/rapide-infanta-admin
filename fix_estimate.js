const fs = require('fs');

const path = 'src/components/estimates/EstimateForm.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('saveCustomerRecord')) {
  content = content.replace("import { buildLegacyName, formatContactPerson } from '@/utils/customer'", 
    "import { buildLegacyName, formatContactPerson } from '@/utils/customer'\nimport { saveCustomerRecord } from '@/utils/customerSaveHelper'");
}

const insertRegex1 = /const payload = \{[\s\S]*?customer_type: customerType,[\s\S]*?tin: customerTin \|\| null\n\s*\}/;

const newInsert1 = `const { data: newCust, error: custErr } = await saveCustomerRecord(supabase, {
      customerType,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      companyName: cleanCompanyName,
      contactFirstName,
      contactLastName,
      mobile: customerMobile,
      telephone: customerTelephone,
      email: customerEmail,
      address: customerAddress,
      tin: customerTin
    })`;

content = content.replace(insertRegex1, newInsert1);
content = content.replace(/const \{ data: newCust, error: custErr \} = await supabase\.from\('customers'\)\.insert\(\[payload\]\)\.select\(\)\.single\(\)/, "");


const insertRegex2 = /const customerPayload = \{[\s\S]*?customer_type: customerType,[\s\S]*?tin: customerType === 'company' \? customerTin : null\n\s*\};/;

const newInsert2 = `const { data: newCust, error: custErr } = await saveCustomerRecord(supabase, {
          customerType,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          companyName: cleanCompanyName,
          contactFirstName: cleanContactFirst,
          contactLastName: cleanContactLast,
          mobile: customerMobile,
          telephone: customerTelephone,
          email: customerEmail,
          address: customerAddress,
          tin: customerTin
        })`;

content = content.replace(insertRegex2, newInsert2);
content = content.replace(/const \{ data: newCust, error: custErr \} = await supabase\.from\('customers'\)\.insert\(customerPayload\)\.select\(\)\.single\(\)/, "");

fs.writeFileSync(path, content);
console.log('Fixed estimate form');
