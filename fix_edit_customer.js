const fs = require('fs');

const path = 'src/app/(dashboard)/customers/[id]/edit/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add the import
content = content.replace("import { buildLegacyName } from '@/utils/customer'", 
  "import { buildLegacyName } from '@/utils/customer'\nimport { saveCustomerRecord } from '@/utils/customerSaveHelper'");

// Replace the update logic
const updateRegex = /const \{ error: updateError \} = await supabase\s*\.from\('customers'\)\s*\.update\(\{[\s\S]*?\}\)\s*\.eq\('id', id\)/;

const newUpdate = `const { error: updateError } = await saveCustomerRecord(supabase, {
        id,
        customerType,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        companyName: cleanName,
        contactFirstName: cleanContactFirst,
        contactLastName: cleanContactLast,
        mobile,
        telephone,
        email,
        address,
        tin,
        notes
      })`;

content = content.replace(updateRegex, newUpdate);
fs.writeFileSync(path, content);
console.log('Fixed edit page');
