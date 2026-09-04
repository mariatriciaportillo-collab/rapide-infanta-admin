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

// 1. suppliers/page.tsx
processFile('src/app/(dashboard)/suppliers/page.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/suppliers\/\$\{supplier\.id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/> Edit[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Edit} label="Edit Supplier" href={\`/suppliers/\${supplier.id}/edit\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 2. purchase-orders/page.tsx
processFile('src/app/(dashboard)/purchase-orders/page.tsx', (content) => {
  content = ensureImports(content, ['Eye']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/purchase-orders\/\$\{po\.id\}`\}[\s\S]*?>[\s\S]*?View PO[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Eye} label="View Purchase Order" href={\`/purchase-orders/\${po.id}\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 3. outside-purchases/page.tsx
processFile('src/app/(dashboard)/outside-purchases/page.tsx', (content) => {
  content = ensureImports(content, ['Eye']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/outside-purchases\/\$\{op\.id\}`\}[\s\S]*?>[\s\S]*?View OP[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Eye} label="View Outside Purchase" href={\`/outside-purchases/\${op.id}\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 4. labor-charges/LaborChargesClient.tsx
processFile('src/app/(dashboard)/labor-charges/LaborChargesClient.tsx', (content) => {
  content = ensureImports(content, ['Edit']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/labor-charges\/\$\{labor\.id\}\/edit`\}[\s\S]*?>[\s\S]*?<Edit size=\{16\} \/> Edit[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Edit} label="Edit Labor Charge" href={\`/labor-charges/\${labor.id}/edit\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 5. inventory/page.tsx
processFile('src/app/(dashboard)/inventory/page.tsx', (content) => {
  content = ensureImports(content, ['Eye']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/inventory\/\$\{item\.id\}`\}[\s\S]*?>[\s\S]*?View[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Eye} label="View Inventory" href={\`/inventory/\${item.id}\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 6. stock-adjustments/page.tsx
processFile('src/app/(dashboard)/stock-adjustments/page.tsx', (content) => {
  content = ensureImports(content, ['Eye']);
  const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link[\s\S]*?href=\{`\/stock-adjustments\/\$\{adj\.id\}`\}[\s\S]*?>[\s\S]*?View[\s\S]*?<\/Link>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-6 py-4">
                        <TableActions align="right">
                          <TableAction icon={Eye} label="View Adjustment" href={\`/stock-adjustments/\${adj.id}\`} />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

