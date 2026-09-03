const fs = require('fs');

// 1. Fix creation from Estimate to set DRAFT
const path1 = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content1 = fs.readFileSync(path1, 'utf8');
content1 = content1.replace(/status: 'UNPAID',/g, "status: 'DRAFT',");
fs.writeFileSync(path1, content1);

// 2. Add Push to Payments logic in Invoice View
const path2 = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content2 = fs.readFileSync(path2, 'utf8');

const importReplacement = `import { ArrowLeft, Printer, FileText, CheckCircle, Edit, Building2, User as UserIcon, Car, DollarSign, X, ArrowRightCircle } from 'lucide-react'`;
content2 = content2.replace(/import \{ ArrowLeft,.*?\} from 'lucide-react'/, importReplacement);

const logicReplacement = `
  const handlePushToPayments = async () => {
    if (!confirm('Finalize this invoice and push to Payments? This will officially deduct parts inventory and lock the items.')) return;
    
    // Deduct inventory ONLY ONCE
    if (!inv.inventory_deducted) {
      for (const item of inv.invoice_items) {
        if (item.part_id) {
          const { data: currentPart } = await supabase.from('parts_inventory').select('stock_quantity').eq('id', item.part_id).single()
          if (currentPart) {
            await supabase.from('parts_inventory').update({ stock_quantity: Number(currentPart.stock_quantity) - Number(item.quantity) }).eq('id', item.part_id)
          }
        }
      }
    }

    await supabase.from('invoices').update({ status: 'UNPAID', inventory_deducted: true }).eq('id', inv.id)
    window.location.reload()
  }

  const handleRecordPayment = async () => {`;

content2 = content2.replace(/  const handleRecordPayment = async \(\) => \{/, logicReplacement);

const buttonReplacement = `
          {inv.status === 'DRAFT' && (
            <button onClick={handlePushToPayments} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <ArrowRightCircle size={16} /> Push to Payments
            </button>
          )}
          
          {(inv.status === 'UNPAID' || inv.status === 'PARTIALLY PAID') && (
            <button onClick={() => { setPayAmount(inv.balance_due); setShowPaymentModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
              <DollarSign size={16} /> Record Payment
            </button>
          )}
`;
content2 = content2.replace(/          \{Number\(inv\.balance_due\) > 0 && \([\s\S]*?<\/button>\n          \)\}/, buttonReplacement);

fs.writeFileSync(path2, content2);
