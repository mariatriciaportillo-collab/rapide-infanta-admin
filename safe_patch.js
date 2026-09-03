const fs = require('fs');

const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert handleCreateInvoice before handleApprove
const createInvoiceFn = `
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

    const newItems = items.map((i) => ({
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

content = content.replace('  const handleApprove = async () => {', createInvoiceFn + '\n  const handleApprove = async () => {');

// We also need to add the buttons in the UI.
// Let's find where the Edit button is rendered.
/*
            {(!estimate.status || (estimate.status !== "JOB STARTED" && estimate.status !== "APPROVED")) && (
              <Link href={`/estimates/${estimate.id}/edit`} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <Edit size={16} /> Edit
              </Link>
            )}
*/

const editLinkRegex = /\{\(!estimate\.status \|\| \(estimate\.status !== "JOB STARTED" && estimate\.status !== "APPROVED"\)\) && \(\s*<Link href=\{`\/estimates\/\$\{estimate\.id\}\/edit`\} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition">\s*<Edit size=\{16\} \/> Edit\s*<\/Link>\s*\)\}/;

const replacement = `{(!estimate.status || (estimate.status !== "JOB STARTED" && estimate.status !== "APPROVED" && estimate.status !== "COMPLETED")) && (
              <Link href={\`/estimates/\${estimate.id}/edit\`} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <Edit size={16} /> Edit
              </Link>
            )}
            {(estimate.status === 'APPROVED' || estimate.status === 'JOB STARTED') && (
              <button onClick={handleCreateInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
                <CheckCircle size={16} /> Complete Job / Create Invoice
              </button>
            )}
            {estimate.status === 'COMPLETED' && (
              <button onClick={handleCreateInvoice} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
                <FileText size={16} /> View Invoice
              </button>
            )}`;

content = content.replace(editLinkRegex, replacement);

fs.writeFileSync(path, content);
