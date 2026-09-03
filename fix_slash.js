const fs = require('fs');
let paths = [
  'src/components/payments/PaymentReceipt.tsx',
  'src/app/(dashboard)/invoice/[id]/receipt/page.tsx',
  'src/app/(dashboard)/quick-sale/[id]/receipt/page.tsx'
];

for(let p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(p, content);
}
