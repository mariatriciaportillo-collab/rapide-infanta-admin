const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newLoad = `
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('invoices')
        .select(\`
          *,
          invoice_items(*),
          customers:customer_id(*),
          vehicles:vehicle_id(*),
          estimates( quotation_id )
        \`)
        .eq('id', id)
        .single()
        
      if (data) {
        // Fetch valid payments
        const quotationId = data.estimates?.quotation_id || null;
        let paymentQuery = supabase.from('payments').select('*');
        if (quotationId) {
          paymentQuery = paymentQuery.or(\`invoice_id.eq.\${data.id},quotation_id.eq.\${quotationId}\`);
        } else {
          paymentQuery = paymentQuery.eq('invoice_id', data.id);
        }
        
        const { data: payments } = await paymentQuery;
        const validPayments = (payments || []).filter(p => Number(p.amount_paid) > 0);
        
        const totalPaid = validPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const balanceDue = Math.max(0, Number(data.grand_total) - totalPaid);
        
        let computedStatus = 'UNPAID';
        if (balanceDue <= 0) computedStatus = 'PAID';
        else if (totalPaid > 0) computedStatus = 'PARTIALLY PAID';
        
        // Always reflect computed status in UI
        data.amount_paid = totalPaid;
        data.balance_due = balanceDue;
        data.status = computedStatus;
        
        // Auto-fix DB silently if it got out of sync
        supabase.from('invoices').update({
          amount_paid: totalPaid,
          balance_due: balanceDue,
          status: computedStatus
        }).eq('id', data.id).then();

        setInv(data)
      }
      setLoading(false)
    }
    load()
  }, [id, supabase])
`;

content = content.replace(
  /useEffect\(\(\) => \{\n    async function load\(\) \{[\s\S]*?\}\n    load\(\)\n  \}, \[id, supabase\]\)/,
  newLoad
);

const newHandlePayment = `
  const handlePayment = async () => {
    const amount = parseFloat(payAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount")
      return
    }
    if (amount > Number(inv.balance_due)) {
      alert("Amount exceeds remaining balance")
      return
    }

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

    // Determine payment type
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

    // Update Invoice
    const newAmountPaid = Number(inv.amount_paid) + amount
    const newBalanceDue = Number(inv.grand_total) - newAmountPaid
    let newStatus = 'UNPAID'
    if (newBalanceDue <= 0) newStatus = 'PAID'
    else if (newAmountPaid > 0) newStatus = 'PARTIALLY PAID'

    await supabase.from('invoices').update({
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
      status: newStatus
    }).eq('id', inv.id)

    setIsSubmitting(false)
    setShowPaymentModal(false)
    
    // Redirect to consolidated receipt
    router.push(\`/invoice/\${inv.id}/receipt\`)
  }
`;

content = content.replace(
  /const handlePayment = async \(\) => \{[\s\S]*?router\.refresh\(\)\n  \}/,
  newHandlePayment
);

const receiptBtn = "{/* View Receipt */}\n" +
  "              {(inv.status === 'PAID' || inv.status === 'PARTIALLY PAID' || Number(inv.amount_paid) > 0) && (\n" +
  "                <Link href={`/invoice/${inv.id}/receipt`} className=\"bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md font-medium text-sm transition flex items-center gap-2\">\n" +
  "                  <FileText size={18} /> View Receipt\n" +
  "                </Link>\n" +
  "              )}\n\n" +
  "              {/* Collect Payment */}\n" +
  "              {inv.status !== 'PAID' && (";

content = content.replace(
  /\{\/\* Collect Payment \*\/\}\n              \{inv\.status !== 'PAID' && \(/,
  receiptBtn
);

fs.writeFileSync(path, content);
