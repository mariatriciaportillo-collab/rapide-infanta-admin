const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');
file = file.replace(/text-\[9px\] font-bold text-slate-800">CUSTOMER'S SIGNATURE/g, "text-[10px] font-bold text-slate-800 uppercase\">CUSTOMER'S SIGNATURE");
file = file.replace(/text-\[8px\] text-slate-500 uppercase tracking-wider">Customer Signature & Date\/Time/g, 'text-[9px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME');
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
