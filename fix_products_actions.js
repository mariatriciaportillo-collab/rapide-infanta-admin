const fs = require('fs');

const files = [
  'src/app/(dashboard)/parts/page.tsx',
  'src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx',
  'src/app/(dashboard)/labor-charges/page.tsx',
  'src/app/(dashboard)/packages/page.tsx',
  'src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx',
  'src/app/(dashboard)/part-labor-rules/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Fix bg-slate-50 inside td
  c = c.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, (match, p1, p2) => {
    // Only remove bg-slate-50 from td (not hover:bg-slate-50, not thead bg-slate-50)
    if (match.includes('px-') || match.includes('text-sm')) {
      return `className="${p1}${p2}"`.replace('  ', ' ');
    }
    return match;
  });

  // Action column alignment
  c = c.replace(/<td className="([^"]*?)text-center([^"]*?)">(\s*<Link[\s\S]*?>\s*Edit\s*<\/Link>\s*)<\/td>/g, (match, p1, p2, inner) => {
    return `<td className="${p1}text-right${p2}">${inner}</td>`;
  });

  // Rewrite <Link href="...">Edit</Link> -> <TableActions align="right"><TableAction icon={Edit} label="Edit" href="..." /></TableActions>
  // Assuming Edit icon is imported. If not, we might need to add it.
  c = c.replace(/<Link\s*href=\{`([^`]+)`\}\s*className="[^"]*"\s*>\s*Edit\s*<\/Link>/g, '<TableActions align="right"><TableAction icon={Edit} label="Edit" href={`$1`} /></TableActions>');

  // Make sure Edit and TableActions, TableAction are imported
  if (c.includes('<TableActions') && !c.includes('TableActions')) {
    c = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + c;
  }
  if (c.includes('icon={Edit}') && !c.includes('Edit')) {
    c = c.replace(/import \{([^}]+)\}\ from 'lucide-react'/, 'import { Edit, $1 } from \'lucide-react\'');
  }

  // Double check the Action header is aligned right and w-16
  const thRegex = /<th className="([^"]*?)">(\s*Action\s*|\s*Actions\s*)<\/th>/ig;
  c = c.replace(thRegex, (match, classes, inner) => {
    classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
    if (!classes.includes('text-right')) classes += ' text-right';
    if (!classes.includes('w-16')) classes += ' w-16';
    return `<th className="${classes}">${inner}</th>`;
  });

  fs.writeFileSync(file, c);
});
console.log('Fixed actions in Products & Services tables');
