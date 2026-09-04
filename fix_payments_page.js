const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newLink = `
                      <td className="px-4 py-3 font-medium text-blue-600 hover:underline">
                        {p.invoices ? (
                          <Link href={\`/invoice/\${p.invoice_id}/receipt\`} target="_blank">{p.receipt_number}</Link>
                        ) : p.quick_sales ? (
                          <Link href={\`/quick-sale/\${p.quick_sale_id}/receipt\`} target="_blank">{p.receipt_number}</Link>
                        ) : p.quotation_id ? (
                          <Link href={\`/quotations/\${p.quotation_id}\`} target="_blank">{p.receipt_number}</Link>
                        ) : (
                          <span>{p.receipt_number}</span>
                        )}
                      </td>
`;

content = content.replace(
  /<td className="px-4 py-3 font-medium text-blue-600 hover:underline">\n\s*<Link href=\{\`\/payments\/\$\{p\.id\}\/print\`\} target="_blank">\{p\.receipt_number\}<\/Link>\n\s*<\/td>/,
  newLink
);

fs.writeFileSync(path, content);
