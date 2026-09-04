const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add payments(customer_receipt) to qData query
const oldQQuery = "estimates(id, invoices(status))`)";
const newQQuery = "estimates(id, invoices(status)), payments(customer_receipt)`)";
content = content.replace(oldQQuery, newQQuery);

// 2. Add "Receipt" column to Downpayment tab
const oldDPThead = `<th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-center">Action</th>`;
const newDPThead = `<th className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                  <th className="px-4 py-3 font-semibold text-center">Action</th>`;
content = content.replace(oldDPThead, newDPThead);

// 3. Add Receipt cell in Downpayment map
const oldDPTbody = /<td className="px-4 py-3">\n\s*<span className=\{\`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider.*?\}\}>\n\s*\{\(q\.downpayment_status === 'PAID' \|\| Number\(q\.downpayment_paid_amount\) >= Number\(q\.required_downpayment_amount\)\) \? 'PAID' : \(q\.downpayment_status \|\| 'PENDING'\)\}\n\s*<\/span>\n\s*<\/td>/;
const newDPTbody = `<td className="px-4 py-3">
                        <span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                          {(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? 'PAID' : (q.downpayment_status || 'PENDING')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {(q.payments && q.payments.length > 0) ? q.payments[q.payments.length - 1].customer_receipt || '-' : '-'}
                      </td>`;
content = content.replace(oldDPTbody, newDPTbody);

// 4. Update History colSpans from 8 to 9 because we added Receipt column?
// Wait, Downpayment colSpan was 8. It should be 9.
content = content.replace(/colSpan=\{8\}/g, 'colSpan={9}');

// 5. Update History table - it already shows {p.customer_receipt || p.receipt_number} from my manual fix earlier? Wait, no, I didn't add customer_receipt to history table yet, I just added it to downpayment earlier? Let's check history body.
content = content.replace(
  /<td className="px-4 py-3 font-medium text-slate-800">\n\s*\{p\.receipt_number\}\n\s*<\/td>/,
  `<td className="px-4 py-3 font-medium text-slate-800">
                        {p.customer_receipt || 'PENDING'}
                        <span className="block text-[10px] text-slate-400 font-normal">Internal: {p.receipt_number}</span>
                      </td>`
);

fs.writeFileSync(path, content);
