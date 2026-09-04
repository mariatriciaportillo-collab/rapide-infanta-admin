const fs = require('fs');
const importRegex = /import\s+\{([^}]+)\}\s+from\s+'lucide-react'/;
function ensureImports(content, icons) {
  const match = content.match(importRegex);
  if (match) {
    let existingIcons = match[1].split(',').map(s => s.trim());
    let newIcons = icons.filter(i => !existingIcons.includes(i));
    if (newIcons.length > 0) {
      const newImportString = `import { ${existingIcons.concat(newIcons).join(', ')} } from 'lucide-react'`;
      content = content.replace(importRegex, newImportString);
    }
  }
  if (!content.includes('TableActions')) {
    content = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + content;
  }
  return content;
}

function processFile(path, modifierFn) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    const newContent = modifierFn(content);
    if (newContent !== content) {
      fs.writeFileSync(path, newContent);
      console.log('Updated', path);
    } else {
      console.log('No changes in', path);
    }
  } else {
    console.log('File not found', path);
  }
}

processFile('src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="py-3 px-4 text-center">[\s\S]*?\{item\.source === 'Manual Reference' && item\.raw_id && \([\s\S]*?<Link[\s\S]*?href=\{`\/parts-lookup\/\$\{item\.raw_id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/>[\s\S]*?<\/Link>[\s\S]*?\)\}[\s\S]*?<\/td>/g;
  const rep = `<td className="py-3 px-4 text-center">
                          <TableActions align="center">
                            {item.source === 'Manual Reference' && item.raw_id && (
                              <TableAction icon={Edit} label="Edit Manual Reference" href={\`/parts-lookup/\${item.raw_id}/edit\`} />
                            )}
                          </TableActions>
                        </td>`;
  return content.replace(regex, rep);
});

processFile('src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="py-3 px-4 text-center">[\s\S]*?\{item\.source === 'Manual Reference' && item\.raw_id && \([\s\S]*?<Link[\s\S]*?href=\{`\/labor-lookup\/\$\{item\.raw_id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/>[\s\S]*?<\/Link>[\s\S]*?\)\}[\s\S]*?<\/td>/g;
  const rep = `<td className="py-3 px-4 text-center">
                          <TableActions align="center">
                            {item.source === 'Manual Reference' && item.raw_id && (
                              <TableAction icon={Edit} label="Edit Manual Reference" href={\`/labor-lookup/\${item.raw_id}/edit\`} />
                            )}
                          </TableActions>
                        </td>`;
  return content.replace(regex, rep);
});
