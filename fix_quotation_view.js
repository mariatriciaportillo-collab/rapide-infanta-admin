const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

const printBtnRegex = /(<Link href={`\/quotations\/\${quote\.id}\/print`}[^>]+>\s*<Printer size={16} \/>\s*Print\s*<\/Link>)/;

const newBtn = `{(() => {
            const status = (quote.status || '').toUpperCase();
            const hasDownpayment = quote.downpayment_amount > 0 || (quote.payments && quote.payments.length > 0);
            const isConverted = quote.is_converted || quote.invoice_id || status === 'CONVERTED';
            const isCompleted = status === 'COMPLETED';
            const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED';
            
            return canEdit ? (
              <Link href={\`/quotations/\${quote.id}/edit\`} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition font-medium">
                <Edit size={16} /> Edit
              </Link>
            ) : null;
          })()}
          $1`;

if (!file.includes('canEdit')) {
  file = file.replace(printBtnRegex, newBtn);
  fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
}
