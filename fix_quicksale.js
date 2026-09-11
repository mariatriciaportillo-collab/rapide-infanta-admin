const fs = require('fs');

const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('saveCustomerRecord')) {
  content = content.replace("import { buildLegacyName } from '@/utils/customer'", 
    "import { buildLegacyName } from '@/utils/customer'\nimport { saveCustomerRecord } from '@/utils/customerSaveHelper'");
}

const insertRegex = /const \{ data, error \} = await supabase\.from\('customers'\)\.insert\(\{[\s\S]*?\}\)\.select\(\)\.single\(\)/;

const newInsert = `const { data, error } = await saveCustomerRecord(supabase, {
        customerType,
        firstName,
        lastName,
        companyName,
        contactFirstName,
        contactLastName,
        mobile: customerMobile,
        telephone: customerTelephone,
        email: customerEmail,
        address: customerAddress,
        tin: customerTin
      })`;

content = content.replace(insertRegex, newInsert);
fs.writeFileSync(path, content);
console.log('Fixed quick-sale');
