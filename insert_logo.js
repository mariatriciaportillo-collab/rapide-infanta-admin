const fs = require('fs');

// View page
let viewFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');
viewFile = viewFile.replace(/<h1 className="text-4xl font-black text-blue-900 tracking-tighter mb-1">RAPIDÉ<\/h1>\s*<p className="text-sm font-medium text-slate-500 tracking-widest uppercase">Auto Service Experts<\/p>/, `<img src="/rapide-logo.png" alt="Rapidé Auto Service Experts" className="h-14 w-auto object-contain mb-2" />`);
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', viewFile);

// Print page
let printFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');
printFile = printFile.replace(/<h1 className="text-4xl font-black text-blue-900 tracking-tighter mb-1">RAPIDÉ<\/h1>\s*<p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Auto Service Experts<\/p>/, `<img src="/rapide-logo.png" alt="Rapidé Auto Service Experts" className="h-10 w-auto object-contain mb-1" />`);
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', printFile);
