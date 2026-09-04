const fs = require('fs');

// 1. Fix payments/page.tsx
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/quotation_number/g, 'quote_number');

// Tab defaults to 'history' and switch the layout visually
content = content.replace(/useState\('downpayment'\)/, "useState('history')");

// Move "Payment History" button BEFORE "Downpayment" button
content = content.replace(
  /<button \n\s*onClick=\{\(\) => setTab\('downpayment'\)\}[\s\S]*?<\/button>\n\s*<button \n\s*onClick=\{\(\) => setTab\('history'\)\}[\s\S]*?<\/button>/,
  `<button 
          onClick={() => setTab('history')}
          className={\`pb-2 px-2 font-medium text-sm transition \${tab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}\`}
        >
          Payment History
        </button>
        <button 
          onClick={() => setTab('downpayment')}
          className={\`pb-2 px-2 font-medium text-sm transition \${tab === 'downpayment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}\`}
        >
          Downpayment
        </button>`
);

// We need an "Action" column in Payment History for the "Print" link (receipt)
// The user asked for columns: Receipt No., Date, Customer, Reference Document, Method, Amount Paid, Action
const newHistoryHeader = `                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt No.</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Ref. Document</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold text-center w-16">Action</th>
                </tr>`;
content = content.replace(
  /<tr>\n\s*<th className="px-4 py-3 font-semibold">Receipt No\.<\/th>[\s\S]*?Amount Paid<\/th>\n\s*<\/tr>/,
  newHistoryHeader
);

const oldHistoryCols = `<td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₱{Number(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>`;
const newHistoryCols = `<td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ₱{Number(p.amount_paid).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {p.invoices ? (
                          <Link href={\`/invoice/\${p.invoice_id}/receipt\`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print</Link>
                        ) : p.quick_sales ? (
                          <Link href={\`/quick-sale/\${p.quick_sale_id}/receipt\`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print</Link>
                        ) : p.quotation_id ? (
                          <Link href={\`/quotations/\${p.quotation_id}/receipt\`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print</Link>
                        ) : null}
                      </td>`;
content = content.replace(oldHistoryCols, newHistoryCols);

// Remove the `Link` wrappers around the Receipt No. because they moved to the Action column!
content = content.replace(
  /<td className="px-4 py-3 font-medium text-blue-600 hover:underline">[\s\S]*?<\/td>/g,
  (match) => {
    // Only target the one in history map which has {p.invoices ? ...}
    if (match.includes('{p.invoices ? (')) {
      return `<td className="px-4 py-3 font-medium text-slate-800">
                        {p.receipt_number}
                      </td>`;
    }
    // Leave the downpayment row alone (it has q.quote_number)
    return match;
  }
);
// Fix colSpan for History table
content = content.replace(/colSpan=\{6\}/g, 'colSpan={7}');


fs.writeFileSync(path, content);


// 2. Fix quotations/[id]/receipt/page.tsx
path = 'src/app/(dashboard)/quotations/[id]/receipt/page.tsx';
content = fs.readFileSync(path, 'utf8');
content = content.replace(/quotation_number/g, 'quote_number');
fs.writeFileSync(path, content);

// 3. Fix quotations/[id]/actions.ts
path = 'src/app/(dashboard)/quotations/[id]/actions.ts';
content = fs.readFileSync(path, 'utf8');
content = content.replace(/quote\.quotation_number/g, 'quote.quote_number');
fs.writeFileSync(path, content);

