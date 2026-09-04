const fs = require('fs');
let path = 'src/app/(dashboard)/packages/components/PackageForm.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('TableActions')) {
  content = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + content;
}

const regex = /<td className="px-4 py-3 text-center">[\s\S]*?<button type="button" onClick=\{.*?removeItem.*?\}[\s\S]*?>[\s\S]*?<Trash2 size=\{16\} \/>[\s\S]*?<\/button>[\s\S]*?<\/td>/g;
const rep = `<td className="px-4 py-3 text-center">
                            <TableActions align="center">
                              <TableAction icon={Trash2} label="Remove Item" onClick={() => removeItem(item.id)} variant="destructive" />
                            </TableActions>
                          </td>`;

content = content.replace(regex, rep);

fs.writeFileSync(path, content);
