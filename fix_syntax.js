const fs = require('fs');
const path = 'src/components/quotations/QuotationActionBar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /onClick=\{.*? setShowPaymentModal\(true\)\}\`\)\}/,
  "onClick={() => setShowPaymentModal(true)}"
);

fs.writeFileSync(path, content);
