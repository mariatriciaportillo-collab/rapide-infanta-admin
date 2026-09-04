const fs = require('fs');

const path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the query to fetch amount_paid
content = content.replace(
  /invoices:invoice_id\(invoice_number\)/,
  'invoices:invoice_id(invoice_number, amount_paid)'
).replace(
  /quick_sales:quick_sale_id\(quick_sale_number\)/,
  'quick_sales:quick_sale_id(quick_sale_number, amount_paid)'
);

// 2. Rename 'Amount Paid' to 'Total Paid' in the History tab
// The history tab table is the second table in the file.
const regexHeader = /<th className="px-4 py-3 font-semibold text-right">Amount Paid<\/th>/;
// Let's make sure we only replace the one in history tab.
// Downpayment tab has: <th className="px-4 py-3 font-semibold text-right w-32">Amount Paid</th>
// History tab has: <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
content = content.replace(regexHeader, '<th className="px-4 py-3 font-semibold text-right">Total Paid</th>');

// 3. Update the rendering of the amount
const regexAmountCell = /<td className="px-4 py-3 text-right font-bold text-emerald-600">\s*₱\{Number\(p\.amount_paid\)\.toLocaleString\('en-US', \{minimumFractionDigits: 2\}\)\}\s*<\/td>/;
const replacementAmountCell = `<td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₱{Number(p.invoices?.amount_paid || p.quick_sales?.amount_paid || p.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>`;
content = content.replace(regexAmountCell, replacementAmountCell);

fs.writeFileSync(path, content);
console.log('Fixed history total logic');
