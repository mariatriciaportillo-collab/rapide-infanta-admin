const fs = require('fs');

// 1. Fix Customer Accounts pagination size
const customerPages = [
  'src/app/(dashboard)/customers/page.tsx',
  'src/app/(dashboard)/vehicles/page.tsx'
];

customerPages.forEach(file => {
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/const pageSize = 25/g, 'const pageSize = 10');
    fs.writeFileSync(file, c);
    console.log(`Updated pageSize to 10 in ${file}`);
  }
});

// 2. Simplify Stock Column in Parts & Materials
const partsPage = 'src/app/(dashboard)/parts/page.tsx';
if (fs.existsSync(partsPage)) {
  let c = fs.readFileSync(partsPage, 'utf8');
  
  // Find the stock column td
  // <td className="px-4 py-3">
  //   <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
  //     Number(part.stock_quantity) <= Number(part.reorder_level || 0) 
  //       ? 'bg-red-50 text-red-700 border border-red-200' 
  //       : 'bg-green-50 text-green-700 border border-green-200'
  //   }`}>
  //     {part.stock_quantity} {part.unit}
  //   </span>
  // </td>
  
  const stockRegex = /<td className="px-4 py-3">\s*<span className=\{`inline-flex[^`]*\$\{\s*Number\(part\.stock_quantity\)[^}]*\}\s*`\}>\s*\{part\.stock_quantity\} \{part\.unit\}\s*<\/span>\s*<\/td>/;
  const replacement = `<td className="px-4 py-3 whitespace-nowrap font-medium text-sm">\n                          <span className={\n                            Number(part.stock_quantity) <= Number(part.reorder_level || 0) \n                              ? 'text-red-600' \n                              : 'text-emerald-600'\n                          }>\n                            {part.stock_quantity} {part.unit}\n                          </span>\n                        </td>`;
  
  if (c.match(stockRegex)) {
    c = c.replace(stockRegex, replacement);
    fs.writeFileSync(partsPage, c);
    console.log(`Simplified Stock column in ${partsPage}`);
  } else {
    console.log(`Could not match stock regex in ${partsPage}`);
  }
}
