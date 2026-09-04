const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update Downpayment Query
const oldDownpaymentQuery = /\.eq\('status', 'APPROVED'\)\s*\.eq\('downpayment_required', true\)\s*\.or\('downpayment_status\.neq\.PAID,downpayment_status\.is\.null'\)/;
const newDownpaymentQuery = `.in('status', ['APPROVED', 'CONVERTED'])
      .eq('downpayment_required', true)`;
content = content.replace(oldDownpaymentQuery, newDownpaymentQuery);

// Add estimates(id, invoices(status)) to Downpayment select
content = content.replace(
  /vehicles:vehicle_id\(make, model, plate_number\)/,
  "vehicles:vehicle_id(make, model, plate_number), estimates(id, invoices(status))"
);

// 2. Add filtering to Downpayment results
const oldSetDownpayments = /setDownpayments\(qData \|\| \[\]\)/;
const newSetDownpayments = `const activeQs = (qData || []).filter(q => {
      if (q.estimates) {
        const ests = Array.isArray(q.estimates) ? q.estimates : [q.estimates];
        for (const est of ests) {
          if (est.invoices) {
            const invs = Array.isArray(est.invoices) ? est.invoices : [est.invoices];
            for (const inv of invs) {
              if (inv.status === 'PAID') return false; // Fully paid final invoice, remove from Downpayment tab
            }
          }
        }
      }
      return true;
    });
    setDownpayments(activeQs);`;
content = content.replace(oldSetDownpayments, newSetDownpayments);

// 3. Update History Query to exclude DOWNPAYMENT
content = content.replace(
  /\.order\('created_at', \{ ascending: false \}\)/,
  `.neq('payment_type', 'DOWNPAYMENT')\n      .order('created_at', { ascending: false })`
);

// 4. Update Downpayment Table UI (Add Amount Paid column)
content = content.replace(
  /<th className="px-4 py-3 font-semibold text-right">Required Downpayment<\/th>/,
  '<th className="px-4 py-3 font-semibold text-right">Required Downpayment</th>\n                  <th className="px-4 py-3 font-semibold text-right">Amount Paid</th>'
);

// Add Amount Paid cell
content = content.replace(
  /<td className="px-4 py-3 text-right font-bold text-amber-600">₱\{Number\(q\.required_downpayment_amount - \(q\.downpayment_paid_amount \|\| 0\)\)\.toLocaleString\('en-US', \{minimumFractionDigits: 2\}\)\}<\/td>/,
  `<td className="px-4 py-3 text-right font-bold text-slate-800">₱{Number(q.required_downpayment_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">₱{Number(q.downpayment_paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>`
);

// 5. Update Status cell mapping in Downpayment table
// Status can be PAID or PENDING based on math instead of just downpayment_status to be safe.
const oldStatusCell = /<span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700">\n\s*\{q\.downpayment_status \|\| 'PENDING'\}\n\s*<\/span>/;
const newStatusCell = `<span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                          {(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? 'PAID' : (q.downpayment_status || 'PENDING')}
                        </span>`;
content = content.replace(oldStatusCell, newStatusCell);

// 6. Update Action cell in Downpayment table
const oldActionCell = /<button onClick=\{\(\) => handleOpenModal\(q\)\} className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs">\n\s*Record Downpayment\n\s*<\/button>/;
const newActionCell = `{(q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount)) ? (
                          <Link href={\`/quotations/\${q.id}/receipt\`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print Receipt</Link>
                        ) : (
                          <button onClick={() => handleOpenModal(q)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-xs">
                            Record Downpayment
                          </button>
                        )}`;
content = content.replace(oldActionCell, newActionCell);

// Fix colspans
content = content.replace(/colSpan=\{7\}/g, 'colSpan={8}');

fs.writeFileSync(path, content);
