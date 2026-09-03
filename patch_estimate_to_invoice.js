const fs = require('fs');

const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('handleCreateInvoice')) {
  // Insert the function
  const functionStr = `
  const handleCreateInvoice = async () => {
    if (!confirm('Mark job as Completed and generate Invoice?')) return;
    
    // First, check if invoice already exists
    const { data: existing } = await supabase.from('invoices').select('id').eq('estimate_id', estimate.id).single()
    if (existing) {
      router.push(\`/invoice/\${existing.id}\`)
      return
    }

    // Generate Invoice Number
    const { data: latest } = await supabase.from('invoices').select('invoice_number').ilike('invoice_number', 'INV-%').order('invoice_number', { ascending: false }).limit(1).single()
    let nextSeq = 1
    if (latest && latest.invoice_number) {
      const match = latest.invoice_number.match(/INV-(\\d+)/)
      if (match) nextSeq = parseInt(match[1]) + 1
    }
    const invNumber = \`INV-\${nextSeq.toString().padStart(6, '0')}\`

    const { data: inv, error: invErr } = await supabase.from('invoices').insert({
      invoice_number: invNumber,
      estimate_id: estimate.id,
      customer_id: estimate.customer_id,
      vehicle_id: estimate.vehicle_id,
      status: 'UNPAID',
      subtotal: estimate.subtotal,
      discount_amount: estimate.discount_amount,
      grand_total: estimate.grand_total,
      amount_paid: 0,
      balance_due: estimate.grand_total,
      prepared_by: estimate.prepared_by,
      notes: estimate.notes
    }).select().single()

    if (invErr) { alert(invErr.message); return; }

    const newItems = estimate.estimate_items.map((i) => ({
      invoice_id: inv.id,
      item_type: i.item_type,
      package_id: i.package_id,
      labor_service_id: i.labor_service_id,
      part_id: i.part_id,
      is_section_header: i.is_section_header,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
      sort_order: i.sort_order
    }))

    await supabase.from('invoice_items').insert(newItems)
    await supabase.from('estimates').update({ status: 'COMPLETED' }).eq('id', estimate.id)

    router.push(\`/invoice/\${inv.id}\`)
  }
`;

  // Find where handleReject is defined, insert there
  content = content.replace(/const handleReject = async \(\) => \{/, functionStr + '\n  const handleReject = async () => {');

  // Find the action buttons. We want to show "Create Invoice" if status is 'APPROVED' or 'JOB STARTED'
  // Or if 'COMPLETED' and invoice doesn't exist? Just APPROVED is fine.
  const buttonStr = `
          {(estimate.status === 'APPROVED' || estimate.status === 'JOB STARTED') && (
            <button onClick={handleCreateInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <CheckCircle size={16} /> Complete Job / Create Invoice
            </button>
          )}
          {estimate.status === 'COMPLETED' && (
             <button onClick={handleCreateInvoice} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
               View Invoice
             </button>
          )}
`;

  // Insert before the Edit button
  content = content.replace(/<Link href=\{\`\/estimates\/\$\{estimate.id\}\/edit\`\}/, buttonStr + '\n          <Link href={`/estimates/${estimate.id}/edit`}');

  fs.writeFileSync(path, content);
}
