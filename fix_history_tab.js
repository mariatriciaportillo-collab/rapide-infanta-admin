const fs = require('fs');

let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<td className="px-4 py-3 text-center align-middle">[\s\S]*?\{p\.invoices \? \([\s\S]*?<Link href=\{`\/invoice\/\$\{p\.invoice_id\}\/receipt`\} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print<\/Link>[\s\S]*?\) : p\.quick_sales \? \([\s\S]*?<Link href=\{`\/quick-sale\/\$\{p\.quick_sale_id\}\/receipt`\} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print<\/Link>[\s\S]*?\) : p\.quotation_id \? \([\s\S]*?<Link href=\{`\/quotations\/\$\{p\.quotation_id\}\/receipt`\} target="_blank" className="text-blue-600 hover:underline text-xs font-medium">Print<\/Link>[\s\S]*?\) : null\}[\s\S]*?<\/td>/;

const replacement = `<td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          {p.invoices ? (
                            <TableAction icon={Printer} label="Print Payment Receipt" href={\`/invoice/\${p.invoice_id}/receipt\`} />
                          ) : p.quick_sales ? (
                            <TableAction icon={Printer} label="Print Payment Receipt" href={\`/quick-sale/\${p.quick_sale_id}/receipt\`} />
                          ) : p.quotation_id ? (
                            <TableAction icon={Printer} label="Print Payment Receipt" href={\`/quotations/\${p.quotation_id}/receipt\`} />
                          ) : null}
                        </TableActions>
                      </td>`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content);
