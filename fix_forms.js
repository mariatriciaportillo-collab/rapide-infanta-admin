const fs = require('fs');

function processFile(path, modifierFn) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('TableActions')) {
      content = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + content;
    }
    const newContent = modifierFn(content);
    if (newContent !== content) {
      fs.writeFileSync(path, newContent);
      console.log('Updated', path);
    } else {
      console.log('No changes in', path);
    }
  }
}

// 1. purchase-orders/new/page.tsx
processFile('src/app/(dashboard)/purchase-orders/new/page.tsx', (content) => {
  const regex = /<td className="px-4 py-3 text-center">[\s\S]*?<button[\s\S]*?onClick=\{.*?handleRemoveItem\(item\.id\).*?\}[\s\S]*?>[\s\S]*?<Trash2 size=\{18\} \/>[\s\S]*?<\/button>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          <TableAction 
                            icon={Trash2} 
                            label="Remove Item" 
                            onClick={() => handleRemoveItem(item.id)} 
                            disabled={items.length === 1} 
                            variant="destructive" 
                          />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 2. outside-purchases/new/page.tsx
processFile('src/app/(dashboard)/outside-purchases/new/page.tsx', (content) => {
  const regex = /<td className="px-4 py-3 text-center">[\s\S]*?<button[\s\S]*?onClick=\{.*?handleRemoveItem\(item\.id\).*?\}[\s\S]*?>[\s\S]*?<Trash2 size=\{18\} \/>[\s\S]*?<\/button>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          <TableAction 
                            icon={Trash2} 
                            label="Remove Item" 
                            onClick={() => handleRemoveItem(item.id)} 
                            disabled={items.length === 1} 
                            variant="destructive" 
                          />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});

// 3. stock-adjustments/new/page.tsx
processFile('src/app/(dashboard)/stock-adjustments/new/page.tsx', (content) => {
  const regex = /<td className="px-4 py-3 text-center">[\s\S]*?<button[\s\S]*?onClick=\{.*?handleRemoveItem\(item\.id\).*?\}[\s\S]*?>[\s\S]*?<Trash2 size=\{18\} \/>[\s\S]*?<\/button>[\s\S]*?<\/td>/g;
  const rep = `<td className="px-4 py-3 text-center">
                        <TableActions align="center">
                          <TableAction 
                            icon={Trash2} 
                            label="Remove Item" 
                            onClick={() => handleRemoveItem(item.id)} 
                            disabled={items.length === 1} 
                            variant="destructive" 
                          />
                        </TableActions>
                      </td>`;
  return content.replace(regex, rep);
});
