const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/edit/page.tsx', 'utf8');

const replacement = `  if (error || !quote) {
    notFound()
  }
  
  if (quote.status === 'APPROVED') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quotation Locked</h2>
        <p>This quotation has been approved and converted to an Estimate. It can no longer be edited.</p>
      </div>
    )
  }`;

file = file.replace(/  if \(error \|\| \!quote\) \{\n    notFound\(\)\n  \}/, replacement);
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/edit/page.tsx', file);
