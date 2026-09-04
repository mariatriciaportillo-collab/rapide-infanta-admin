const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace handleRecordPayment correctly
const handleRecPay = `  const handleRecordPayment = async () => {
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return alert('Invalid amount')
    if (amount > Number(inv.balance_due)) return alert('Cannot overpay')
    
    setIsSubmitting(true)
    
    // Create Payment
    const { data: latest } = await supabase.from('payments').select('receipt_number').ilike('receipt_number', 'PAY-%').order('receipt_number', { ascending: false }).limit(1).single()
    let nextSeq = 1
    if (latest && latest.receipt_number) {
      const match = latest.receipt_number.match(/PAY-(\\d+)/)
      if (match) nextSeq = parseInt(match[1]) + 1
    }
    const receiptNumber = \`PAY-\${nextSeq.toString().padStart(6, '0')}\`

    const { data: { user } } = await supabase.auth.getUser()
    const receivedBy = user?.user_metadata?.first_name 
      ? \`\${user.user_metadata.first_name} \${user.user_metadata.last_name}\`.trim()
      : user?.email?.split('@')[0] || 'Unknown User'

    let pType = 'PARTIAL PAYMENT'
    if (amount >= Number(inv.balance_due) && Number(inv.amount_paid) === 0) pType = 'FULL PAYMENT'
    else if (amount >= Number(inv.balance_due)) pType = 'FINAL PAYMENT'

    const { data: payment, error: payErr } = await supabase.from('payments').insert({
      receipt_number: receiptNumber,
      invoice_id: inv.id,
      customer_id: inv.customer_id,
      amount_paid: amount,
      payment_method: payMethod,
      reference_number: payRef,
      received_by: receivedBy,
      payment_type: pType
    }).select().single()

    if (payErr) { alert(payErr.message); setIsSubmitting(false); return; }

    // DO NOT rely on cached inv.amount_paid for calculations because it might be stale.
    // However, since we auto-calculated it on load, it should be safe. 
    // To be strictly robust, we fetch all payments for this invoice now and recalculate.
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
    const newBalanceDue = Math.max(0, Number(inv.grand_total) - totalPaid);
    
    let newStatus = 'UNPAID'
    if (newBalanceDue <= 0) newStatus = 'PAID'
    else if (totalPaid > 0) newStatus = 'PARTIALLY PAID'

    await supabase.from('invoices').update({
      amount_paid: totalPaid,
      balance_due: newBalanceDue,
      status: newStatus
    }).eq('id', inv.id)

    setIsSubmitting(false)
    setShowPaymentModal(false)
    
    router.push(\`/invoice/\${inv.id}/receipt\`)
  }
`;

content = content.replace(
  /const handleRecordPayment = async \(\) => \{[\s\S]*?window\.location\.reload\(\)\n  \}/,
  handleRecPay
);

// We need to add "Payment Receipt" button in the Action Bar!
const receiptBtn = `            {/* View Receipt */}
            {(inv.status === 'PAID' || inv.status === 'PARTIALLY PAID' || Number(inv.amount_paid) > 0) && (
              <Link href={\`/invoice/\${inv.id}/receipt\`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md font-medium text-sm transition flex items-center gap-2">
                <FileText size={18} /> View Receipt
              </Link>
            )}

            {/* Collect Payment */}
            {inv.status !== 'PAID' && (`;

content = content.replace(
  /\{\/\* Collect Payment \*\/\}\n\s*\{inv\.status !== 'PAID' && \(/,
  receiptBtn
);

fs.writeFileSync(path, content);
