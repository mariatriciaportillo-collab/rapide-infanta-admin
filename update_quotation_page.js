const fs = require('fs');
const path = 'src/app/(dashboard)/quotations/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<QuotationActionBar quotationId=\{quote\.id\} initialStatus=\{quote\.status\} initialEstimateId=\{est\?\.id\} \/>/,
  "<QuotationActionBar quote={quote} initialEstimateId={est?.id} />"
);

fs.writeFileSync(path, content);
