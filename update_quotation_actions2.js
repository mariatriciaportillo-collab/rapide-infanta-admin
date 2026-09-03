const fs = require('fs');
const path = 'src/app/(dashboard)/quotations/[id]/actions.ts';
let content = fs.readFileSync(path, 'utf8');

const newAction = `

export async function recordDownpayment(quotationId: string, amount: number, method: string, reference: string) {
  const supabase = await createClient()

  const { data: quote } = await supabase.from('quotations').select('*').eq('id', quotationId).single()
  if (!quote) throw new Error("Quotation not found")

  // Generate Receipt Number
  let nextSeq = 1
  const { data: latest } = await supabase.from('payments').select('receipt_number').ilike('receipt_number', 'PAY-%').order('receipt_number', { ascending: false }).limit(1).maybeSingle()
  if (latest && latest.receipt_number) {
    const match = latest.receipt_number.match(/PAY-(\\d+)/)
    if (match) nextSeq = parseInt(match[1]) + 1
  }
  const receiptNumber = \`PAY-\${nextSeq.toString().padStart(6, '0')}\`

  const { data: { user } } = await supabase.auth.getUser()
  const receivedBy = user?.user_metadata?.first_name 
    ? \`\${user.user_metadata.first_name} \${user.user_metadata.last_name}\`.trim()
    : user?.email?.split('@')[0] || 'Unknown User'

  // Insert payment
  const { error: payErr } = await supabase.from('payments').insert({
    receipt_number: receiptNumber,
    customer_id: quote.customer_id,
    amount_paid: amount,
    payment_method: method,
    reference_number: reference,
    received_by: receivedBy,
    payment_type: 'DOWNPAYMENT',
    source_type: 'QUOTATION',
    source_reference: quote.quotation_number,
    quotation_id: quote.id,
    quotation_total: quote.grand_total,
    required_downpayment: quote.required_downpayment_amount
  })
  if (payErr) throw new Error(payErr.message)

  // Update Quotation
  const newPaid = Number(quote.downpayment_paid_amount || 0) + amount
  let newStatus = 'REQUIRED'
  if (newPaid >= Number(quote.required_downpayment_amount || 0)) {
    newStatus = 'PAID'
  } else if (newPaid > 0) {
    newStatus = 'PARTIAL'
  }

  await supabase.from('quotations').update({
    downpayment_paid_amount: newPaid,
    downpayment_status: newStatus
  }).eq('id', quotationId)

  revalidatePath(\`/quotations/\${quotationId}\`)
  return { success: true }
}
`;

content = content + newAction;
fs.writeFileSync(path, content);
