const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

// 1. Inject style block
const wrapperRegex = /(<div className="bg-white min-h-screen text-slate-900 font-sans print:m-0 print:p-0 print:bg-white text-sm">)/;
file = file.replace(wrapperRegex, `$1
      <style dangerouslySetInnerHTML={{__html: \`
        @media print {
          @page { size: auto; margin: 4mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      \`}} />`);

// 2. Reduce empty spaces
// Reduce top padding
file = file.replace(/className="p-8 print:p-0 max-w-4xl mx-auto"/, 'className="p-6 print:p-4 max-w-4xl mx-auto"');
// Reduce header margin
file = file.replace(/className="flex justify-between items-start mb-8"/, 'className="flex justify-between items-start mb-4"');
file = file.replace(/className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-4"/, 'className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2"');
// Reduce spacing around Two-column info
file = file.replace(/className="flex border-b border-slate-300"/, 'className="flex border-y border-slate-300"'); // Maybe keep as is
file = file.replace(/className="w-1\/3 p-4 border-r border-slate-300"/g, 'className="w-1/3 p-3 border-r border-slate-300"');
file = file.replace(/className="w-1\/3 p-4"/g, 'className="w-1/3 p-3"');
// Items spacing
file = file.replace(/className="px-6 pt-4 pb-2 space-y-4"/, 'className="px-6 pt-3 pb-1 space-y-3"');
// Reduce footer spacing
file = file.replace(/className="mt-8 px-6 pt-6 border-t-2 border-slate-800 flex justify-between gap-8 page-break-inside-avoid"/, 'className="mt-4 px-6 pt-4 border-t-2 border-slate-800 flex justify-between gap-8 page-break-inside-avoid"');
file = file.replace(/className="mt-8 px-6 grid grid-cols-2 gap-8 page-break-inside-avoid"/, 'className="mt-4 px-6 grid grid-cols-2 gap-4 page-break-inside-avoid"');
file = file.replace(/<div className="w-48 text-center pt-8">/, '<div className="w-48 text-center pt-4">');

// 3. Fix Customer Authorization Signature block
const oldAuthRegex = /<div className="mt-auto flex justify-between gap-4">\s*<div className="flex-1 text-center">\s*<div className="border-b border-slate-800 mb-1"><\/div>\s*<p className="text-\[9px\] font-bold text-slate-500 uppercase tracking-wider">Customer Name \/ Signature<\/p>\s*<\/div>\s*<div className="w-24 text-center">\s*<div className="border-b border-slate-800 mb-1"><\/div>\s*<p className="text-\[9px\] font-bold text-slate-500 uppercase tracking-wider">Date<\/p>\s*<\/div>\s*<\/div>/;

const newAuthStr = `<div className="mt-auto flex justify-between gap-6 pt-6">
            <div className="flex-1 text-center">
              <div className="border-b border-slate-800 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-800">APPROVED BY</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
            </div>
            <div className="flex-1 text-center">
              <div className="border-b border-slate-800 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
            </div>
          </div>`;

file = file.replace(oldAuthRegex, newAuthStr);

// Reduce padding in Legal blocks
file = file.replace(/<div className="border border-slate-300 rounded p-4 flex flex-col">/g, '<div className="border border-slate-300 rounded p-3 flex flex-col">');
file = file.replace(/<p className="text-\[9px\] text-slate-600 text-justify mb-8">/, '<p className="text-[9px] text-slate-600 text-justify mb-4">');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
