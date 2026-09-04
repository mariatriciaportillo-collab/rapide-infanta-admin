const fs = require('fs');
const path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const handleRecPay = `  const handleRecordPayment = async () => {
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return alert('Invalid amount')
    if (amount > Number(sale.balance_due)) return alert('Cannot overpay')
    
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
    if (amount >= Number(sale.balance_due) && Number(sale.amount_paid) === 0) pType = 'FULL PAYMENT'
    else if (amount >= Number(sale.balance_due)) pType = 'FINAL PAYMENT'

    const { data: payment, error: payErr } = await supabase.from('payments').insert({
      receipt_number: receiptNumber,
      quick_sale_id: sale.id,
      customer_id: sale.customer_id,
      amount_paid: amount,
      payment_method: payMethod,
      reference_number: payRef,
      received_by: receivedBy,
      payment_type: pType,
      source_type: 'QUICKSALE',
      source_reference: sale.quick_sale_number
    }).select().single()

    if (payErr) { alert(payErr.message); setIsSubmitting(false); return; }

    const { data: payments } = await supabase.from('payments').select('*').eq('quick_sale_id', sale.id);
    
    const validPayments = (payments || []).filter(p => Number(p.amount_paid) > 0);
    const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const newBalanceDue = Math.max(0, Number(sale.grand_total) - totalPaid);
    
    let newStatus = 'UNPAID'
    if (newBalanceDue <= 0) newStatus = 'PAID'
    else if (totalPaid > 0) newStatus = 'PARTIALLY PAID'

    await supabase.from('quick_sales').update({
      amount_paid: totalPaid,
      balance_due: newBalanceDue,
      status: newStatus
    }).eq('id', sale.id)

    setIsSubmitting(false)
    setShowPaymentModal(false)
    
    router.push(\`/quick-sale/\${sale.id}/receipt\`)
  }
`;

content = content.replace(
  /const handleRecordPayment = async \(\) => \{[\s\S]*?window\.location\.reload\(\)\n  \}/,
  handleRecPay
);

// We need to add "View Receipt" button in the Action Bar!
const receiptBtn = `          {sale.inventory_deducted && (sale.status === 'PAID' || sale.status === 'PARTIALLY PAID' || Number(sale.amount_paid) > 0) && (
            <Link href={\`/quick-sale/\${sale.id}/receipt\`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <FileText size={16} /> View Receipt
            </Link>
          )}

          {sale.inventory_deducted && (sale.status === 'UNPAID' || sale.status === 'PARTIALLY PAID') && (`;

content = content.replace(
  /\{sale\.inventory_deducted && \(sale\.status === 'UNPAID' \|\| sale\.status === 'PARTIALLY PAID'\) && \(/,
  receiptBtn
);

fs.writeFileSync(path, content);
