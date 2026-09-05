const fs = require('fs');

const files = [
  'src/app/(dashboard)/parts/page.tsx',
  'src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx',
  'src/app/(dashboard)/labor-charges/LaborChargesClient.tsx',
  'src/app/(dashboard)/packages/page.tsx',
  'src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx',
  'src/app/(dashboard)/part-labor-rules/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Remove `font-mono` from Part No. / Code / etc.
  c = c.replace(/font-mono/g, '');

  // Category in packages: `<td className="px-4 py-3 text-slate-700 font-medium">` -> `<td className="px-4 py-3 text-slate-500">`
  c = c.replace(/<td className="px-4 py-3 text-slate-700 font-medium">/g, '<td className="px-4 py-3 text-slate-500">');
  
  // Replace text-slate-800 with text-slate-900 in Prices
  c = c.replace(/font-medium text-slate-800/g, 'font-medium text-slate-900');

  // Remove `bg-slate-50` from secondary cells (some Labor tables had bg inside the cells).
  c = c.replace(/<td className="([^"]*)bg-slate-50([^"]*)">/g, '<td className="$1$2">');
  c = c.replace(/className="px-4 py-3 text-sm font-medium text-slate-600 "/g, 'className="px-4 py-3 text-slate-500 text-xs"');
  
  // Make sure table container matches Operations exactly:
  // Operations uses: className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"
  c = c.replace(/className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"/g, 'className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"');
  
  // Make sure table tags are exact
  c = c.replace(/<table className="w-full text-left border-collapse">/g, '<table className="w-full text-left text-sm whitespace-nowrap">');

  // Fix Action header / icons again in case LaborChargesClient missed it
  c = c.replace(/<td className="([^"]*?)text-center([^"]*?)">(\s*<Link[\s\S]*?>\s*Edit\s*<\/Link>\s*)<\/td>/g, (match, p1, p2, inner) => {
    return `<td className="${p1}text-right${p2}">${inner}</td>`;
  });
  c = c.replace(/<Link\s*href=\{`([^`]+)`\}\s*className="[^"]*"\s*>\s*Edit\s*<\/Link>/g, '<TableActions align="right"><TableAction icon={Edit} label="Edit" href={`$1`} /></TableActions>');
  if (c.includes('<TableActions') && !c.includes('TableActions')) {
    c = `import { TableActions, TableAction } from '@/components/ui/TableActions'\n` + c;
  }
  if (c.includes('icon={Edit}') && !c.includes('Edit')) {
    c = c.replace(/import \{([^}]+)\}\ from 'lucide-react'/, 'import { Edit, $1 } from \'lucide-react\'');
  }

  // Ensure headers are correct
  c = c.replace(/<tr className="[^"]*(bg-slate-50|bg-slate-100|text-xs|uppercase|font-bold|border-b)[^"]*">/g, '<tr>');
  
  // Right align headers that contain Price, Cost, Amount, Total
  const words = ['Total', 'Amount', 'Price', 'Cost', 'Grand Total', 'Subtotal', 'Paid', 'Balance', 'Total Paid', 'Labor MT', 'Labor AT', 'Labor Rate'];
  words.forEach(word => {
    const regex = new RegExp(`(<th className="([^"]*?)">\\s*)(${word})(\\s*<\\/th>)`, 'ig');
    c = c.replace(regex, (match, prefix, classes, inner, suffix) => {
      if (!classes.includes('text-right')) {
        prefix = prefix.replace(classes, classes.replace(/\btext-(center|left)\b/g, '').trim() + ' text-right');
      }
      return prefix + inner + suffix;
    });
  });

  const thRegex = /<th className="([^"]*?)">(\s*Action\s*|\s*Actions\s*)<\/th>/ig;
  c = c.replace(thRegex, (match, classes, inner) => {
    classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
    if (!classes.includes('text-right')) classes += ' text-right';
    if (!classes.includes('w-16')) classes += ' w-16';
    return `<th className="${classes}">${inner}</th>`;
  });

  // Action column alignment inside td
  const tdRegex = /<td className="([^"]*?)">([\s\S]*?)<\/td>/g;
  c = c.replace(tdRegex, (match, classes, inner) => {
    if (inner.includes('<TableActions') || inner.includes('TableAction ') || (inner.includes('<Link') && inner.includes('Edit') && classes.includes('w-16'))) {
      if (!classes.includes('text-right')) {
        classes = classes.replace(/\btext-(center|left)\b/g, '').trim();
        return `<td className="${classes} text-right">${inner}</td>`;
      }
    }
    if (inner.includes('<TableActions align="center"')) {
       inner = inner.replace('<TableActions align="center"', '<TableActions align="right"');
       return `<td className="${classes}">${inner}</td>`;
    }
    return match;
  });
  
  // 1. Table tags base style (tbody tr, etc.)
  c = c.replace(/<table className="[^"]*"/g, '<table className="w-full text-left text-sm whitespace-nowrap"');
  c = c.replace(/<thead[^>]*>/g, '<thead className="bg-slate-50 text-slate-500 border-b border-slate-200">');
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

  fs.writeFileSync(file, c);
});
console.log('Cleaned up Products & Services tables deeply');
