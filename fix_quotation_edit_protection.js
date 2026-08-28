const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/edit/page.tsx', 'utf8');

const protectionCode = `  const status = (quote.status || '').toUpperCase()
  const hasDownpayment = quote.downpayment_amount > 0 || (quote.payments && quote.payments.length > 0)
  const isConverted = quote.is_converted || quote.invoice_id || status === 'CONVERTED'
  const isCompleted = status === 'COMPLETED'
  const canEdit = !hasDownpayment && !isConverted && !isCompleted && status !== 'REJECTED'

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quotation Locked</h2>
        <p className="text-slate-600 mb-6">
          {hasDownpayment 
            ? "This quotation cannot be edited because a downpayment has been received." 
            : isConverted 
              ? "This quotation cannot be edited because it has already been converted."
              : "This quotation is locked and cannot be edited."}
        </p>
        <a href={\`/quotations/\${id}\`} className="bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-700 font-medium">
          Return to View
        </a>
      </div>
    )
  }
`;

if (!file.includes('canEdit')) {
  file = file.replace(/(const { data: quote, error } = [^]+?\.single\(\)\n)/, `$1\n${protectionCode}\n`);
  fs.writeFileSync('src/app/(dashboard)/quotations/[id]/edit/page.tsx', file);
}
