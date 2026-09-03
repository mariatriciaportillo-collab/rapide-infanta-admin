const fs = require('fs');

function replaceFormatCustomer(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/if \(c\.customer_type === 'company'\) return c\.company_name/g, "if (c.customer_type === 'company') return c.name");
  content = content.replace(/return \`\$\{c\.first_name\} \$\{c\.last_name\}\`/g, "return c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()");
  fs.writeFileSync(filePath, content);
}

replaceFormatCustomer('src/app/(dashboard)/invoice/page.tsx');
replaceFormatCustomer('src/app/(dashboard)/payments/page.tsx');
replaceFormatCustomer('src/app/(dashboard)/quick-sale/page.tsx');

