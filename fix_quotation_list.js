const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/page.tsx', 'utf8');

// The list maps over quotations. I'll add an edit link conditionally.
// Find: <Link href={`/quotations/${q.id}/print`}
const printLink = '<Link href={`/quotations/${q.id}/print`} className="text-slate-600 hover:text-slate-800 font-medium text-xs uppercase tracking-wider">\n                        Print\n                      </Link>';

const newLinks = `{(() => {
                        const status = (q.status || '').toUpperCase();
                        const hasDownpayment = q.downpayment_amount > 0 || (q.payments && q.payments.length > 0);
                        const isConverted = q.is_converted || q.invoice_id || status === 'CONVERTED';
                        const isCompleted = status === 'COMPLETED';
                        const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED';
                        
                        return (
                          <>
                            {canEdit ? (
                              <Link href={\`/quotations/\${q.id}/edit\`} className="text-amber-600 hover:text-amber-800 font-medium text-xs uppercase tracking-wider flex items-center gap-1">
                                Edit
                              </Link>
                            ) : (
                              <span className="text-slate-400 font-medium text-xs uppercase tracking-wider cursor-not-allowed flex items-center gap-1" title={hasDownpayment ? "Locked — Downpayment Received" : (isConverted ? "Locked — Converted" : "Locked")}>
                                Locked
                              </span>
                            )}
                            <Link href={\`/quotations/\${q.id}/print\`} className="text-slate-600 hover:text-slate-800 font-medium text-xs uppercase tracking-wider">
                              Print
                            </Link>
                          </>
                        );
                      })()}`;

if (!file.includes('canEdit')) {
  file = file.replace(printLink, newLinks);
  fs.writeFileSync('src/app/(dashboard)/quotations/page.tsx', file);
}
