const fs = require('fs');

const viewPath = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let viewContent = fs.readFileSync(viewPath, 'utf8');
viewContent = viewContent.replace(/<h1 className="text-2xl font-bold text-slate-800">\{inv\.invoice_number\}<\/h1>/, '<h1 className="text-2xl font-bold text-slate-800">Billing Statement</h1>');
viewContent = viewContent.replace(/<p className="text-slate-500 text-sm">Created \{format\(new Date\(inv\.created_at\), 'MMM d, yyyy'\)\}<\/p>/, '<p className="text-slate-500 text-sm font-medium">Invoice No. {inv.invoice_number} &middot; Created {format(new Date(inv.created_at), \'MMM d, yyyy\')}</p>');
fs.writeFileSync(viewPath, viewContent);

const printPath = 'src/app/(dashboard)/invoice/[id]/print/page.tsx';
let printContent = fs.readFileSync(printPath, 'utf8');
printContent = printContent.replace(/<h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Invoice<\/h2>/, '<h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Billing Statement</h2>');
fs.writeFileSync(printPath, printContent);

