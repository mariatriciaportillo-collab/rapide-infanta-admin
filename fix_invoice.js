const fs = require('fs');
let path = 'src/app/(dashboard)/invoice/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<td className="px-4 py-3 text-center align-middle">[\s\S]*?<Link href=\{`\/invoice\/\$\{s\.id\}\/print`\}[\s\S]*?title="Print Billing Statement">[\s\S]*?<Printer size=\{18\} \/>[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
const rep = `<td className="px-4 py-3 text-center align-middle">
                      <TableActions align="center">
                        <TableAction icon={Printer} label="Print Billing Statement" href={\`/invoice/\${s.id}/print\`} />
                      </TableActions>
                    </td>`;

content = content.replace(regex, rep);
fs.writeFileSync(path, content);
