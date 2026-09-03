const fs = require('fs');

const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure necessary imports are present
if (!content.includes('CheckCircle')) {
  content = content.replace(
    /import \{ ArrowLeft,.*?\} from 'lucide-react'/,
    "import { ArrowLeft, Printer, FileText, CheckCircle, Edit, Building2, User as UserIcon, Car } from 'lucide-react'"
  );
} else {
  // Just in case ArrowRightCircle or similar is needed, but CheckCircle is standard
  content = content.replace(
    /import \{ ArrowLeft,.*?\} from 'lucide-react'/,
    "import { ArrowLeft, Printer, FileText, CheckCircle, Edit, Building2, User as UserIcon, Car } from 'lucide-react'"
  );
}

// Add the handleCreateInvoice function before handleApprove
const createInvoiceFn = `
  const handleCreateInvoice = async () => {
    if (!confirm('Complete this job?\\n\\nThis will mark the Estimate as completed and create the customer\\'s Invoice/Billing Statement. The Estimate will remain locked.')) return;
    
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
      status: 'DRAFT', // Starts as DRAFT for "Invoice Preparation" phase
      subtotal: estimate.subtotal,
      discount_amount: estimate.discount_amount,
      grand_total: estimate.grand_total,
      amount_paid: 0,
      balance_due: estimate.grand_total,
      inventory_deducted: false,
      prepared_by: estimate.prepared_by,
      notes: estimate.notes
    }).select().single()

    if (invErr) { alert(invErr.message); return; }

    const newItems = items.map((i) => ({
      invoice_id: inv.id,
      item_type: i.item_type,
      package_id: i.package_id,
      labor_service_id: i.labor_service_id,
      part_id: i.part_id, // This uses the final saved part (even if replaced)
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

if (!content.includes('handleCreateInvoice')) {
  content = content.replace('  const handleApprove = async () => {', createInvoiceFn + '\n  const handleApprove = async () => {');
}

// Modify the Action Bar to include the new button
// Existing Action Bar:
/*
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-800">Estimate #{estimate.estimate_number}</h2>
            {(!estimate.status || (estimate.status !== "JOB STARTED" && estimate.status !== "APPROVED")) && (
              <Link href={`/estimates/${estimate.id}/edit`} className="text-slate-400 hover:text-blue-600 transition" title="Edit">
                <Edit size={20} />
              </Link>
            )}
          </div>
*/

// Let's replace the whole header actions part robustly
const headerRegex = /<div className="flex items-center gap-4">([\s\S]*?)<div className="flex items-center gap-3">/;
const newHeader = `<div className="flex items-center gap-4">
          <Link href="/estimates" className="text-slate-400 hover:text-slate-600 transition">
            <ArrowLeft size={24} />
          </Link>
          
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-800">Estimate #{estimate.estimate_number}</h2>
            
            {/* Action Bar */}
            {(!estimate.status || (estimate.status !== "JOB STARTED" && estimate.status !== "COMPLETED")) && (
              <Link href={\`/estimates/\${estimate.id}/edit\`} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <Edit size={16} /> Edit
              </Link>
            )}
            
            {(estimate.status === 'APPROVED' || estimate.status === 'JOB STARTED') && (
              <button onClick={handleCreateInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <CheckCircle size={16} /> Complete Job
              </button>
            )}
            
            {estimate.status === 'COMPLETED' && (
              <button onClick={handleCreateInvoice} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition">
                <FileText size={16} /> View Invoice
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">`;

// Wait, the original source doesn't have the last `div`. Let's just find the exact block.
// I will read the file and replace it programmatically.
