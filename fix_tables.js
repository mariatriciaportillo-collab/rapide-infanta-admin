const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/(dashboard)/**/page.tsx');
files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  let original = c;
  
  // Extra > in tr
  c = c.replace(/className="hover:bg-slate-50">>/g, 'className="hover:bg-slate-50">');
  
  // Right align headers that contain Price, Cost, Amount, Total
  // Using a function to keep original case
  const words = ['Total', 'Amount', 'Price', 'Cost', 'Grand Total', 'Subtotal', 'Paid', 'Balance', 'Total Paid'];
  words.forEach(word => {
    const regex = new RegExp(`(<th className="([^"]*?)">\\s*)(${word})(\\s*<\\/th>)`, 'ig');
    c = c.replace(regex, (match, prefix, classes, inner, suffix) => {
      if (!classes.includes('text-right')) {
        prefix = prefix.replace(classes, classes.replace(/\btext-(center|left)\b/g, '').trim() + ' text-right');
      }
      return prefix + inner + suffix;
    });
  });

  // Fix badges (the one with `inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide`)
  const badBadgeRegex = /inline-flex items-center px-2\.5 py-1 rounded-md text-xs font-bold tracking-wide/g;
  c = c.replace(badBadgeRegex, 'inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase');

  // Fix product name truncation
  // If we find <td className="px-4 py-3 font-bold text-slate-900">{part.name}</td>
  // We should add truncate max-w-[200px]
  c = c.replace(/<td className="px-4 py-3 font-bold text-slate-900">(\{part\.name\})<\/td>/g, '<td className="px-4 py-3 font-bold text-slate-900 truncate max-w-[250px]" title={part.name}>$1</td>');
  c = c.replace(/<td className="px-4 py-3 font-bold text-slate-900">(\{pkg\.name\})<\/td>/g, '<td className="px-4 py-3 font-bold text-slate-900 truncate max-w-[250px]" title={pkg.name}>$1</td>');
  c = c.replace(/<td className="px-4 py-3 font-bold text-slate-900">(\{item\.name\})<\/td>/g, '<td className="px-4 py-3 font-bold text-slate-900 truncate max-w-[250px]" title={item.name}>$1</td>');

  // Group / Category stacking
  // "If the existing structure requires two lines, keep it readable but avoid unnecessary height."
  // It's currently: 
  // <div className="font-bold text-slate-800">{part.part_groups?.name || '—'}</div>
  // <div className="text-slate-500">{part.part_categories?.name}</div>
  // This is already fine for compact height, we just want to ensure we don't have excessive padding.
  
  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log(`Fixed tables in ${file}`);
  }
});
