const fs = require('fs');

function processFile(path) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('TableActions')) {
      content = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + content;
    }
    const regex = /<button[\s\S]*?onClick=\{.*?handleRemoveItem\(item\.id\).*?\}[\s\S]*?>[\s\S]*?<Trash2 size=\{16\} \/>[\s\S]*?<\/button>/g;
    const rep = `<TableAction 
                            icon={Trash2} 
                            label="Remove Item" 
                            onClick={() => handleRemoveItem(item.id)} 
                            variant="destructive" 
                          />`;
    const newContent = content.replace(regex, rep);
    if (newContent !== content) {
      fs.writeFileSync(path, newContent);
      console.log('Updated', path);
    } else {
      console.log('No changes in', path);
    }
  }
}

processFile('src/app/(dashboard)/outside-purchases/new/page.tsx');
processFile('src/app/(dashboard)/stock-adjustments/new/page.tsx');
