const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The best way in Supabase JS to handle this is .or('downpayment_status.neq.PAID,downpayment_status.is.null')
content = content.replace(
  /\.neq\('downpayment_status', 'PAID'\)/,
  ".or('downpayment_status.neq.PAID,downpayment_status.is.null')"
);

fs.writeFileSync(path, content);
