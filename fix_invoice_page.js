const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fetch payments dynamically
const dataFetch = `
  const { data: inv, error } = await supabase
    .from('invoices')
    .select(\`
      *,
      invoice_items(*),
      estimates( quotation_id )
    \`)
    .eq('id', id)
    .single()

  if (error || !inv) notFound()

  // Fetch all payments for this invoice OR its quotation
  const quotationId = inv.estimates?.quotation_id || null;
  let paymentQuery = supabase.from('payments').select('*');
  
  if (quotationId) {
    paymentQuery = paymentQuery.or(\`invoice_id.eq.\${inv.id},quotation_id.eq.\${quotationId}\`);
  } else {
    paymentQuery = paymentQuery.eq('invoice_id', inv.id);
  }
  
  const { data: payments } = await paymentQuery.order('created_at', { ascending: true });
  const validPayments = (payments || []).filter(p => p.amount_paid > 0);
  
  // Recalculate strictly
  const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const balanceDue = Math.max(0, Number(inv.grand_total) - totalPaid);
  
  // Determine correct status
  let computedStatus = 'UNPAID';
  if (balanceDue <= 0) computedStatus = 'PAID';
  else if (totalPaid > 0) computedStatus = 'PARTIALLY PAID';
  
  // Auto-correct DB if out of sync (Optional, but good for data integrity)
  if (Number(inv.amount_paid) !== totalPaid || Number(inv.balance_due) !== balanceDue || inv.status !== computedStatus) {
    await supabase.from('invoices').update({
      amount_paid: totalPaid,
      balance_due: balanceDue,
      status: computedStatus
    }).eq('id', inv.id);
    
    // update local object so render is immediate
    inv.amount_paid = totalPaid;
    inv.balance_due = balanceDue;
    inv.status = computedStatus;
  }
`;

content = content.replace(
  /const \{ data: inv, error \} = await supabase[\s\S]*?if \(error \|\| !inv\) \{\n    notFound\(\)\n  \}/,
  dataFetch
);

fs.writeFileSync(path, content);
