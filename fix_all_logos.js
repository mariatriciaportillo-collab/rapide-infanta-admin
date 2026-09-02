const fs = require('fs');

// 1. Update View Page
let viewFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');
viewFile = viewFile.replace(/<h1 className="text-4xl font-black tracking-tighter text-blue-900 uppercase">RAPIDÉ<\/h1>/, '<img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-10 w-auto object-contain" />');
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', viewFile);

// 2. Update Print Page
let printFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');
printFile = printFile.replace(/<h1 className="text-3xl font-black tracking-tighter text-blue-900 uppercase">RAPIDÉ<\/h1>/, '<img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-8 w-auto object-contain" />');
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', printFile);

// 3. Update Quotation Form (New/Edit Page)
let formFile = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');
formFile = formFile.replace(/<h1 className="text-3xl font-black text-blue-900 tracking-tighter uppercase">RAPIDÉ<\/h1>/, '<img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-8 w-auto object-contain" />');
fs.writeFileSync('src/components/quotations/QuotationForm.tsx', formFile);

// 4. Update Sidebar layout
let layoutFile = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');
const oldSidebarBrand = /<h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">\s*RAPIDÉ\s*<span className="w-2 h-2 rounded-full bg-yellow-400 inline-block -translate-y-2"><\/span>\s*<\/h1>/;
layoutFile = layoutFile.replace(oldSidebarBrand, '<img src="/rapide-wordmark-clean.png" alt="Rapidé" className="h-8 w-auto object-contain filter brightness-0 invert" />');
fs.writeFileSync('src/app/(dashboard)/layout.tsx', layoutFile);

console.log('Done fixing logos');
