const fs = require('fs');

const path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regexDPTable = /<table className="w-full text-left text-sm">[\s\S]*?<thead className="bg-slate-50 text-slate-500 border-b border-slate-200">[\s\S]*?<\/thead>[\s\S]*?<tbody className="divide-y divide-slate-100">[\s\S]*?<\/tbody>[\s\S]*?<\/table>/;

const newTable = `<table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-24">Receipt No.</th>
                  <th className="px-4 py-3 font-semibold w-full">Customer</th>
                  <th className="px-4 py-3 font-semibold w-24">Quotation</th>
                  <th className="px-4 py-3 font-semibold text-right w-32">Quotation Total</th>
                  <th className="px-4 py-3 font-semibold text-right w-32">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold w-24 text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : downpayments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No pending downpayments</td></tr>
                ) : (
                  downpayments.map(q => {
                    const paymentsArr = Array.isArray(q.payments) ? q.payments : (q.payments ? [q.payments] : []);
                    const receipt = paymentsArr.length > 0 && paymentsArr[paymentsArr.length - 1].customer_receipt 
                      ? paymentsArr[paymentsArr.length - 1].customer_receipt 
                      : '—';
                    
                    const isPaid = q.downpayment_status === 'PAID' || Number(q.downpayment_paid_amount) >= Number(q.required_downpayment_amount);
                    
                    return (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{receipt}</td>
                        <td className="px-4 py-3 text-slate-800 max-w-[200px] truncate" title={formatCustomerName(q.customers)}>
                          {formatCustomerName(q.customers)}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                          <Link href={\`/quotations/\${q.id}\`}>{q.quote_number}</Link>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">₱{Number(q.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">₱{Number(q.downpayment_paid_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={\`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>
                            {isPaid ? 'PAID' : (q.downpayment_status || 'PENDING')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <TableActions align="center">
                            {isPaid ? (
                              <TableAction icon={Printer} label="Print Downpayment Receipt" href={\`/quotations/\${q.id}/receipt\`} />
                            ) : (
                              <TableAction icon={Banknote} label="Record Downpayment" onClick={() => handleOpenModal(q)} variant="success" />
                            )}
                          </TableActions>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>`;

if (content.match(regexDPTable)) {
  content = content.replace(regexDPTable, newTable);
  fs.writeFileSync(path, content);
  console.log("Updated downpayments table");
} else {
  console.log("Could not find table to replace");
}
