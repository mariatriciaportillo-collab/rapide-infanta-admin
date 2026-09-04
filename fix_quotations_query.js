const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove .neq('payment_type', 'DOWNPAYMENT') from the quotations query
const badQuery = `.in('status', ['APPROVED', 'CONVERTED'])
      .eq('downpayment_required', true)
      .neq('payment_type', 'DOWNPAYMENT')
      .order('created_at', { ascending: false })`;

const goodQuery = `.in('status', ['APPROVED', 'CONVERTED'])
      .eq('downpayment_required', true)
      .order('created_at', { ascending: false })`;

content = content.replace(badQuery, goodQuery);
fs.writeFileSync(path, content);
