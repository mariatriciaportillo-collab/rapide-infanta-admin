const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/parts/page.tsx', 'utf8');

// Part No.
c = c.replace(/<td className="px-4 py-3 text-slate-600">\{part\.part_number/g, '<td className="px-4 py-3 text-slate-600 whitespace-nowrap">{part.part_number');

// Brand
c = c.replace(/<td className="px-4 py-3 text-slate-600">\{part\.brands/g, '<td className="px-4 py-3 text-slate-600 whitespace-nowrap">{part.brands');

// Cost
c = c.replace(/<td className="px-4 py-3 text-slate-500 text-right">₱\{Number/g, '<td className="px-4 py-3 text-slate-500 text-right whitespace-nowrap">₱{Number');

// Selling Price
c = c.replace(/<td className="px-4 py-3 font-medium text-slate-900 text-right">₱\{Number/g, '<td className="px-4 py-3 font-medium text-slate-900 text-right whitespace-nowrap">₱{Number');

// Status
c = c.replace(/<td className="px-4 py-3">\s*<span className=\{`inline-flex/g, '<td className="px-4 py-3 whitespace-nowrap">\n                          <span className={`inline-flex');

// Actions
c = c.replace(/<td className="px-4 py-3 text-right">/g, '<td className="px-4 py-3 text-right whitespace-nowrap">');

fs.writeFileSync('src/app/(dashboard)/parts/page.tsx', c);
console.log('Fixed parts td wrapping');
