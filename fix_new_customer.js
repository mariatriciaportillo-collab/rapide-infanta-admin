const fs = require('fs');

const path = 'src/app/(dashboard)/customers/new/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add the import
content = content.replace("import { buildLegacyName } from '@/utils/customer'", 
  "import { buildLegacyName } from '@/utils/customer'\nimport { saveCustomerRecord } from '@/utils/customerSaveHelper'");

// Replace the insert logic
const insertRegex = /const \{ data, error: insertError \} = await supabase\s*\.from\('customers'\)\s*\.insert\(\{[\s\S]*?\}\)\s*\.select\(\)\s*\.single\(\)/;

const newInsert = `const { data, error: insertError } = await saveCustomerRecord(supabase, {
        customerType,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        companyName: cleanCompanyName,
        contactFirstName: cleanContactFirst,
        contactLastName: cleanContactLast,
        mobile,
        telephone,
        email,
        address,
        tin,
        notes
      })`;

content = content.replace(insertRegex, newInsert);
fs.writeFileSync(path, content);
console.log('Fixed new page');
