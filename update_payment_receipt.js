const fs = require('fs');
let path = 'src/components/payments/PaymentReceipt.tsx';
let content = fs.readFileSync(path, 'utf8');

// The PaymentHistory type needs customer_receipt
content = content.replace(
  /amount_paid: number\n\s*received_by: string/,
  `amount_paid: number\n  received_by: string\n  customer_receipt?: string`
);

// Update receiptNo generation
content = content.replace(
  /const receiptNo = lastPayment\?\.id \? \`REC-\\\$\{\w+\.id\.substring\(0, 8\)\.toUpperCase\(\)\}\` : 'N\/A'/,
  "const receiptNo = lastPayment?.customer_receipt || 'N/A'"
);
// Also support if it was already compiled or different syntax
content = content.replace(
  /const receiptNo = lastPayment\?\.id \? `REC-\$\{lastPayment\.id\.substring\(0, 8\)\.toUpperCase\(\)\}` : 'N\/A'/,
  "const receiptNo = lastPayment?.customer_receipt || 'N/A'"
);

fs.writeFileSync(path, content);
