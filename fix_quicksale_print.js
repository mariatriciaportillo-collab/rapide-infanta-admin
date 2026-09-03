const fs = require('fs');
const path = 'src/app/(dashboard)/quick-sale/[id]/print/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const dynamicCalc = `
  const { data: payments } = await supabase.from('payments').select('*').eq('quick_sale_id', sale.id);
  const validPayments = (payments || []).filter(p => Number(p.amount_paid) > 0);
  
  const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const balanceDue = Math.max(0, Number(sale.grand_total) - totalPaid);
  
  let computedStatus = 'UNPAID';
  if (balanceDue <= 0) computedStatus = 'PAID';
  else if (totalPaid > 0) computedStatus = 'PARTIALLY PAID';
  
  sale.amount_paid = totalPaid;
  sale.balance_due = balanceDue;
  sale.status = computedStatus;
`;

content = content.replace(
  /const isCompany = sale\.customer_type === 'company'/,
  dynamicCalc + "\\n\\n  const isCompany = sale.customer_type === 'company'"
);

fs.writeFileSync(path, content);
