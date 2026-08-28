const fs = require('fs');

// 1. Update View Page
let viewFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');
const viewHeaderOld = /<img src="https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:ANd9GcQTX8Xigj2p8bEaP3vO-6sFEeildEUl6k7tViArCkyMu3NHEtHFvYaPr3Bt&s=10" alt="Rapidé Auto Service Experts" className="h-14 w-auto object-contain mb-2" \/>\s*<div className="mt-4 text-sm text-slate-600 space-y-1">\s*<p>Infanta Branch<\/p>\s*<p>123 Main Highway, Infanta, Quezon<\/p>\s*<p>042-123-4567 \/ 0917-123-4567<\/p>\s*<\/div>/;
const viewHeaderNew = `<div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tighter text-blue-900 uppercase">RAPIDÉ</h1>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">INFANTA</h2>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800 space-y-0.5">
              <p>OPERATED BY: MGP AUTO REPAIR CENTER</p>
              <p>PUROK 2, BRGY. MISWA INFANTA, QUEZON</p>
              <p>0920-416-4552</p>
            </div>`;
viewFile = viewFile.replace(viewHeaderOld, viewHeaderNew);
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', viewFile);

// 2. Update Print Page
let printFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');
const printHeaderOld = /<img src="https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:ANd9GcQTX8Xigj2p8bEaP3vO-6sFEeildEUl6k7tViArCkyMu3NHEtHFvYaPr3Bt&s=10" alt="Rapidé Auto Service Experts" className="h-10 w-auto object-contain mb-1" \/>\s*<div className="mt-3 text-xs text-slate-600 space-y-0\.5">\s*<p>Infanta Branch<\/p>\s*<p>123 Main Highway, Infanta, Quezon<\/p>\s*<p>042-123-4567 \/ 0917-123-4567<\/p>\s*<\/div>/;
const printHeaderNew = `<div className="flex items-baseline gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tighter text-blue-900 uppercase">RAPIDÉ</h1>
            <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">INFANTA</h2>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-slate-800 space-y-0.5">
            <p>OPERATED BY: MGP AUTO REPAIR CENTER</p>
            <p>PUROK 2, BRGY. MISWA INFANTA, QUEZON</p>
            <p>0920-416-4552</p>
          </div>`;
printFile = printFile.replace(printHeaderOld, printHeaderNew);
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', printFile);

// 3. Update Quotation Form (New/Edit Page)
let formFile = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');
const formHeaderOld = /<img src="https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:ANd9GcQTX8Xigj2p8bEaP3vO-6sFEeildEUl6k7tViArCkyMu3NHEtHFvYaPr3Bt&s=10" alt="Rapidé" className="h-10 w-auto object-contain" \/>/;
const formHeaderNew = `<div className="flex items-baseline gap-2 border-r-2 border-slate-300 pr-4"><h1 className="text-3xl font-black text-blue-900 tracking-tighter uppercase">RAPIDÉ</h1><h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">INFANTA</h2></div>`;
formFile = formFile.replace(formHeaderOld, formHeaderNew);
fs.writeFileSync('src/components/quotations/QuotationForm.tsx', formFile);
