const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldAction = `<Link href={\`/quotations/\${q.id}/receipt\`} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print Receipt</Link>`;
const newAction = `<Link href={\`/quotations/\${q.id}/receipt\`} target="_blank" className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Print Downpayment Receipt">
                            <Printer size={18} />
                          </Link>`;

content = content.replace(oldAction, newAction);

fs.writeFileSync(path, content);
