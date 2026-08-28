const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/page.tsx', 'utf8');

const regex = /(<Link href={`\/quotations\/\${q.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wider">\s*View\s*<\/Link>)\s*(<Link href={`\/quotations\/\${q.id}\/print`})/g;

file = file.replace(regex, `$1
                      {(() => {
                        const status = (q.status || '').toUpperCase();
                        const hasDownpayment = q.downpayment_amount > 0 || (q.payments && q.payments.length > 0);
                        const isConverted = q.is_converted || q.invoice_id || status === 'CONVERTED';
                        const isCompleted = status === 'COMPLETED';
                        const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED';
                        
                        return canEdit ? (
                          <Link href={\`/quotations/\${q.id}/edit\`} className="text-amber-600 hover:text-amber-800 font-medium text-xs uppercase tracking-wider">
                            Edit
                          </Link>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider" title={hasDownpayment ? "Locked — Downpayment Received" : (isConverted ? "Locked — Converted" : "Locked")}>
                            Locked
                          </span>
                        );
                      })()}
                      $2`);

fs.writeFileSync('src/app/(dashboard)/quotations/page.tsx', file);
