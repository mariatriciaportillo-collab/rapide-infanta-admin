const fs = require('fs');

function replaceCustomers(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/first_name, last_name, company_name, customer_type/g, 'name, first_name, last_name, customer_type');
  fs.writeFileSync(filePath, content);
}

replaceCustomers('src/app/(dashboard)/invoice/page.tsx');
replaceCustomers('src/app/(dashboard)/payments/page.tsx');
replaceCustomers('src/app/(dashboard)/quick-sale/page.tsx');
replaceCustomers('src/components/quick-sale/QuickSaleForm.tsx');

