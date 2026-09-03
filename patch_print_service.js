const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/estimate/[id]/print/page.tsx', 'utf8');

// Change w-1/3 to w-1/2 for Bill To and Vehicle
file = file.replace(/<div className="w-1\/3 p-3 border-r border-slate-200">/g, '<div className="w-1/2 p-3 border-r border-slate-200">');
file = file.replace(/<div className="w-1\/3 p-3">/g, '<div className="w-1/2 p-3">');

// Remove Service Details block
const regex = /\{\/\* Service Details \*\/\}(.|\n)*?<\/div>\s*<\/div>\s*\{\/\* Items Table \*\/\}/m;
const replacement = `</div>\n\n      {/* Items Table */}`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/app/(dashboard)/estimate/[id]/print/page.tsx', file);
