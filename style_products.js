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
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let c = fs.readFileSync(file, 'utf8');
  let original = c;

  // 1. Table Container
  c = c.replace(/className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden[^"]*"/g, 'className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"');
  
  // 2. Table tags
  c = c.replace(/<table className="[^"]*"/g, '<table className="w-full text-left text-sm whitespace-nowrap"');
  c = c.replace(/<thead[^>]*>/g, '<thead className="bg-slate-50 text-slate-500 border-b border-slate-200">');
  c = c.replace(/<tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">/g, '<tr>');
  c = c.replace(/<tbody[^>]*>/g, '<tbody className="divide-y divide-slate-100">');
  c = c.replace(/<tr key=\{([^\}]+)\} className="hover:bg-slate-50[^"]*"/g, '<tr key={$1} className="hover:bg-slate-50">');
  
  // 3. Remove excessive bold from headers
  c = c.replace(/<th className="([^"]*?)">/g, (match, classes) => {
    classes = classes.replace(/\b(font-medium|font-bold|text-xs|text-sm|px-6|py-4)\b/g, '').replace(/\s+/g, ' ').trim();
    if (!classes.includes('px-4 py-3')) classes = `px-4 py-3 ${classes}`;
    if (!classes.includes('font-semibold')) classes = `${classes} font-semibold`;
    return `<th className="${classes.trim()}">`;
  });

  // 4. Update cell padding from px-6 py-4 to px-4 py-3
  c = c.replace(/<td className="([^"]*?)">/g, (match, classes) => {
    classes = classes.replace(/\b(px-6|py-4|py-5)\b/g, '').replace(/\s+/g, ' ').trim();
    if (!classes.includes('px-4 py-3')) classes = `px-4 py-3 ${classes}`;
    return `<td className="${classes.trim()}">`;
  });

  // 5. Product Name (font-medium text-slate-900)
  // E.g. <td className="... font-bold text-slate-900 truncate max-w-[250px]"
  c = c.replace(/font-bold text-slate-900/g, 'font-medium text-slate-900');
  c = c.replace(/font-bold text-slate-800/g, 'font-medium text-slate-900');
  
  // 6. Normal text (Brand, Part No)
  // E.g. <td className="... text-slate-600 font-mono text-sm font-medium">
  c = c.replace(/font-mono text-sm font-medium/g, ''); // Remove font-mono for part number
  
  // 7. Cost (muted)
  // Cost usually has text-slate-500. Ensure it's text-slate-500 text-right
  
  // 8. Selling price (bright blue -> primary text)
  // E.g. font-bold text-blue-700
  c = c.replace(/font-bold text-blue-700/g, 'font-medium text-slate-900');

  // 9. Badges
  // Stock badge: 
  c = c.replace(/inline-flex items-center px-2\.5 py-1 rounded-md text-xs font-bold tracking-wide/g, 'inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase');
  // Packages Status badge
  c = c.replace(/px-2 py-1 rounded text-xs font-bold uppercase tracking-wider/g, 'inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase');
  
  // Part-to-labor rules badge
  c = c.replace(/px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider/g, 'inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase');
  
  // 10. Secondary Text (Group / Category)
  // <div className="font-bold text-slate-800"> => font-medium text-slate-900
  // <div className="text-slate-500"> => text-xs text-slate-500
  // This is in parts/page.tsx:
  c = c.replace(/<div className="text-slate-500">\{part\.part_categories\?\.name\}<\/div>/g, '<div className="text-xs text-slate-500">{part.part_categories?.name}</div>');
  c = c.replace(/<div className="text-slate-500">\{rule\.vehicle_makes\?\.name\}<\/div>/g, '<div className="text-xs text-slate-500">{rule.vehicle_makes?.name}</div>');
  c = c.replace(/<div className="text-slate-500">\{rule\.labor_groups\?\.name\}<\/div>/g, '<div className="text-xs text-slate-500">{rule.labor_groups?.name}</div>');
  
  fs.writeFileSync(file, c);
  console.log(`Processed ${file}`);
});
