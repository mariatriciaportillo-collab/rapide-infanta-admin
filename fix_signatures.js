const fs = require('fs');

// 1. Update Print Page
let printFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

// Remove old prepared by from footer
const printFooterOld = `<div className="w-48 text-center pt-2">
          <div className="border-b border-slate-800 mb-1"></div>
          <p className="font-bold text-slate-800 text-xs">{quote.prepared_by}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Prepared By</p>
        </div>`;
printFile = printFile.replace(printFooterOld, '');

// Update signatures
const printSignaturesOld = `<div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[9px] font-bold text-slate-800">APPROVED BY</p>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
        </div>`;
const printSignaturesNew = `<div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">{quote.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
        </div>`;
printFile = printFile.replace(printSignaturesOld, printSignaturesNew);

// adjust text size for Customer Signature just to match visually
printFile = printFile.replace('<p className="text-[9px] font-bold text-slate-800">CUSTOMER\\\'S SIGNATURE</p>', '<p className="text-[10px] font-bold text-slate-800 uppercase">CUSTOMER\\\'S SIGNATURE</p>');
printFile = printFile.replace('<p className="text-[8px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>', '<p className="text-[9px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', printFile);

// 2. Update View Page
let viewFile = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

// Remove old prepared by from footer
const viewFooterOld = `<div className="w-64 text-center">
            <div className="h-16 border-b border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">{quote.prepared_by}</p>
            <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Prepared By</p>
          </div>`;
viewFile = viewFile.replace(viewFooterOld, '');

// The View page might not have the signatures at all right now. Let's insert it before the closing divs.
const viewSignatures = `
        {/* Signatures */}
        <div className="mt-8 px-16 flex justify-between gap-16 pb-12">
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1 h-12"></div>
            <p className="text-xs font-bold text-slate-800 uppercase">{quote.prepared_by}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
          </div>
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1 h-12"></div>
            <p className="text-xs font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>
          </div>
        </div>`;

// Insert it before the last 3 closing divs
viewFile = viewFile.replace(/      <\/div>\n    <\/div>\n  \)\n}/, viewSignatures + '\n      </div>\n    </div>\n  )\n}');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', viewFile);
