const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

const oldAuthRegex = /<div className="mt-auto pt-6 border-t border-slate-100">\s*<div className="grid grid-cols-2 gap-4">\s*<div>\s*<div className="border-b border-slate-400 h-8 mb-1"><\/div>\s*<div className="text-\[10px\] font-bold text-slate-500 uppercase tracking-wider text-center">Customer Name \/ Signature<\/div>\s*<\/div>\s*<div>\s*<div className="border-b border-slate-400 h-8 mb-1"><\/div>\s*<div className="text-\[10px\] font-bold text-slate-500 uppercase tracking-wider text-center">Date<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newAuthStr = `<div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex justify-between gap-8 pt-4">
                <div className="flex-1 text-center">
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="text-[10px] font-bold text-slate-800">APPROVED BY</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="text-[10px] font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
                </div>
              </div>
            </div>`;

file = file.replace(oldAuthRegex, newAuthStr);

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
