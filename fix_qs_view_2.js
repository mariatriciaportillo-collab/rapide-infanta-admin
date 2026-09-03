const fs = require('fs');
const path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\{sale\.status === 'DRAFT' && \(/, "{!sale.inventory_deducted && (");
content = content.replace(/\{\(sale\.status === 'UNPAID' \|\| sale\.status === 'PARTIALLY PAID'\) && \(/, "{sale.inventory_deducted && (sale.status === 'UNPAID' || sale.status === 'PARTIALLY PAID') && (");

fs.writeFileSync(path, content);
