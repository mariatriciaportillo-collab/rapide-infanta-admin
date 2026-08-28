const fs = require('fs');

const LOGO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTX8Xigj2p8bEaP3vO-6sFEeildEUl6k7tViArCkyMu3NHEtHFvYaPr3Bt&s=10";

// 1. Update View Page
let viewFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');
viewFile = viewFile.replace(/\/rapide-logo\.png/g, LOGO_URL);
viewFile = viewFile.replace(/<div>\s*<h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Warranty Terms<\/h4>\s*<p className="text-slate-600">\{quote\.warranty_terms\}<\/p>\s*<\/div>/g, '');
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', viewFile);

// 2. Update Print Page
let printFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');
printFile = printFile.replace(/\/rapide-logo\.png/g, LOGO_URL);
// Remove footer Warranty Terms block
printFile = printFile.replace(/<div>\s*<h4 className="font-bold text-slate-700 uppercase text-\[10px\] tracking-wider mb-1">Warranty Terms<\/h4>\s*<p className="text-slate-600 text-xs">\{quote\.warranty_terms\}<\/p>\s*<\/div>/g, '');
// Remove card Warranty Terms block
printFile = printFile.replace(/\{quote\.warranty_terms && \(\s*<div className="mt-auto pt-2 border-t border-slate-200">\s*<span className="block font-bold text-slate-800 text-\[9px\] mb-0\.5">WARRANTY TERMS<\/span>\s*<span className="text-\[9px\] font-bold text-slate-700">\{quote\.warranty_terms\}<\/span>\s*<\/div>\s*\)\}/g, '');
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', printFile);

// 3. Update Quotation Form (New/Edit Page)
let formFile = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');
formFile = formFile.replace(/\/rapide-logo\.png/g, LOGO_URL);
fs.writeFileSync('src/components/quotations/QuotationForm.tsx', formFile);
