const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="flex justify-between items-end text-emerald-700 font-bold mb-2">\n              <span className="text-sm uppercase tracking-wider">Total Paid<\/span>/,
  `{Number(inv.downpayment_applied) > 0 && (
              <div className="flex justify-between items-end text-blue-600 font-medium mb-1">
                <span className="text-xs uppercase tracking-wider">Less: Downpayment</span>
                <span className="text-sm">₱{Number(inv.downpayment_applied).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="flex justify-between items-end text-emerald-700 font-bold mb-2">
              <span className="text-sm uppercase tracking-wider">Total Paid</span>`
);

fs.writeFileSync(path, content);
