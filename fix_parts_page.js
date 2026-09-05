const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/parts/page.tsx', 'utf8');

// 1. Extra `>` 
c = c.replace(/className="hover:bg-slate-50">>/g, 'className="hover:bg-slate-50">');
// 2. Cost font-medium
c = c.replace(/<td className="px-4 py-3 text-slate-500 font-medium text-right">/g, '<td className="px-4 py-3 text-slate-500 text-right">');
// 3. Brand font-medium
c = c.replace(/<td className="px-4 py-3 text-slate-600 font-medium">/g, '<td className="px-4 py-3 text-slate-600">');
// 4. Clean empty state
c = c.replace(/<td colSpan=\{9\} className="px-4 py-8 text-center text-slate-500 text-center text-slate-500">/g, '<td colSpan={9} className="px-4 py-8 text-center text-slate-500">');
c = c.replace(/<p className="text-base font-medium">/g, '<p>');

fs.writeFileSync('src/app/(dashboard)/parts/page.tsx', c);
