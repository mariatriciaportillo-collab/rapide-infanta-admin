const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /amount_paid: 0,\n      balance_due: estimate\.grand_total,/,
  "amount_paid: estimate.downpayment_carried || 0.00,\n      balance_due: Number(estimate.grand_total) - Number(estimate.downpayment_carried || 0),"
);

fs.writeFileSync(path, content);
