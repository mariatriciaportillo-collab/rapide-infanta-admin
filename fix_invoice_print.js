const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/print/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const dynamicCalc = `
  const quotationId = inv.estimates?.quotation_id || null;
  let paymentQuery = supabase.from('payments').select('*');
  if (quotationId) {
    paymentQuery = paymentQuery.or(\`invoice_id.eq.\${inv.id},quotation_id.eq.\${quotationId}\`);
  } else {
    paymentQuery = paymentQuery.eq('invoice_id', inv.id);
  }
  const { data: payments } = await paymentQuery;
  const validPayments = (payments || []).filter(p => Number(p.amount_paid) > 0);
  
  const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const balanceDue = Math.max(0, Number(inv.grand_total) - totalPaid);
  
  let computedStatus = 'UNPAID';
  if (balanceDue <= 0) computedStatus = 'PAID';
  else if (totalPaid > 0) computedStatus = 'PARTIALLY PAID';
  
  inv.amount_paid = totalPaid;
  inv.balance_due = balanceDue;
  inv.status = computedStatus;
  
  // We can also fetch the downpayment specifically if we need it, but we can compute it from the payments!
  const dpAmount = validPayments.filter(p => p.payment_type === 'DOWNPAYMENT').reduce((sum, p) => sum + Number(p.amount_paid), 0);
  inv.downpayment_applied = dpAmount;
`;

content = content.replace(
  /const isCompany = inv\.customer_type === 'company'/,
  dynamicCalc + "\\n\\n  const isCompany = inv.customer_type === 'company'"
);

// We need to fetch estimates to get quotation_id
content = content.replace(
  /select\(\`\n      \*,\n      invoice_items\(\*\),\n      customers:customer_id\(\*\),\n      vehicles:vehicle_id\(\*\)\n    \`\)/,
  "select(`\n      *,\n      invoice_items(*),\n      customers:customer_id(*),\n      vehicles:vehicle_id(*),\n      estimates( quotation_id )\n    `)"
);

fs.writeFileSync(path, content);
