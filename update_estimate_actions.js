const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /grand_total: estimate\.grand_total,/,
  "grand_total: estimate.grand_total,\n    downpayment_applied: estimate.downpayment_carried || 0.00,"
);

fs.writeFileSync(path, content);
