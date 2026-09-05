const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/parts/page.tsx', 'utf8');

c = c.replace(/<th className="px-4 py-3 font-semibold">PART NO\.<\/th>/, '<th className="px-4 py-3 font-semibold whitespace-nowrap">PART NO.</th>');
c = c.replace(/<th className="px-4 py-3 font-semibold text-right">Cost<\/th>/, '<th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Cost</th>');
c = c.replace(/<th className="px-4 py-3 font-semibold">STOCK<\/th>/, '<th className="px-4 py-3 font-semibold whitespace-nowrap">STOCK</th>');
c = c.replace(/<th className="px-4 py-3 font-semibold">STATUS<\/th>/, '<th className="px-4 py-3 font-semibold whitespace-nowrap">STATUS</th>');

// Allow the td for Group/Category to wrap if needed, but not break words terribly
c = c.replace(/<td className="px-4 py-3 text-slate-600 text-sm">/, '<td className="px-4 py-3 text-slate-600 text-sm min-w-[120px]">');

fs.writeFileSync('src/app/(dashboard)/parts/page.tsx', c);
