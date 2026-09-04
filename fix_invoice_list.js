const fs = require('fs');
let path = 'src/app/(dashboard)/invoice/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(
  /import \{ Plus, Search, FileText \} from 'lucide-react'/,
  "import { Plus, Search, FileText, Printer } from 'lucide-react'"
);

// Update table header
content = content.replace(
  /<th className="px-4 py-3 font-semibold text-right">Balance<\/th>\n\s*<th className="px-4 py-3 font-semibold">Status<\/th>/,
  '<th className="px-4 py-3 font-semibold">Status</th>\n                <th className="px-4 py-3 font-semibold text-center w-16">Action</th>'
);

// Update table body rows
const oldBody = `<td className="px-4 py-3 text-right font-medium text-amber-600">
                      ₱{Number(s.balance_due).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-4 py-3">
                      <span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${
                        s.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                        s.status === 'PARTIALLY PAID' ? 'bg-amber-100 text-amber-700' : s.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }\`}>
                        {s.status}
                      </span>
                    </td>`;

const newBody = `<td className="px-4 py-3">
                      <span className={\`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${
                        s.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                        s.status === 'PARTIALLY PAID' ? 'bg-amber-100 text-amber-700' : s.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }\`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <Link href={\`/invoice/\${s.id}/print\`} target="_blank" className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Print Billing Statement">
                        <Printer size={18} />
                      </Link>
                    </td>`;

content = content.replace(oldBody, newBody);

fs.writeFileSync(path, content);
