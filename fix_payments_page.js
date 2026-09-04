const fs = require('fs');

let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove PENDING and Internal ref
content = content.replace(
  /\{p\.customer_receipt \|\| 'PENDING'\}\s*<span className="block text-\[10px\] text-slate-400 font-normal">Internal: \{p\.receipt_number\}<\/span>/,
  `{p.customer_receipt}`
);

// 2. Fix the Action column in History tab
const regexActions = /<td className="px-4 py-3 text-center align-middle">[\s\S]*?\{p\.invoices \? \([\s\S]*?<Link href=\{`\/invoice\/\$\{p\.invoice_id\}\/receipt`\} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print<\/Link>[\s\S]*?\) : p\.quick_sales \? \([\s\S]*?<Link href=\{`\/quick-sale\/\$\{p\.quick_sale_id\}\/receipt`\} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print<\/Link>[\s\S]*?\) : '-'\}[\s\S]*?<\/td>/;

const repActions = `<td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          {p.invoices ? (
                            <TableAction icon={Printer} label="Print Payment Receipt" href={\`/invoice/\${p.invoice_id}/receipt\`} />
                          ) : p.quick_sales ? (
                            <TableAction icon={Printer} label="Print Payment Receipt" href={\`/quick-sale/\${p.quick_sale_id}/receipt\`} />
                          ) : null}
                        </TableActions>
                      </td>`;

content = content.replace(regexActions, repActions);
fs.writeFileSync(path, content);
