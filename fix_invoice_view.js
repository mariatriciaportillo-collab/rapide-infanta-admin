const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Change condition for "Push to Payments"
content = content.replace(/\{inv\.status === 'DRAFT' && \(/, "{!inv.inventory_deducted && (");

// The button's action shouldn't change the status to UNPAID since it's already UNPAID, just update inventory_deducted
content = content.replace(/await supabase\.from\('invoices'\)\.update\(\{ status: 'UNPAID', inventory_deducted: true \}\)\.eq\('id', inv\.id\)/, "await supabase.from('invoices').update({ inventory_deducted: true }).eq('id', inv.id)");

// Record payment should only be allowed if inventory_deducted is true
content = content.replace(/\{\(inv\.status === 'UNPAID' \|\| inv\.status === 'PARTIALLY PAID'\) && \(/, "{inv.inventory_deducted && (inv.status === 'UNPAID' || inv.status === 'PARTIALLY PAID') && (");

fs.writeFileSync(path, content);
