const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/print/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="flex justify-between text-slate-600 font-bold text-sm">\n              <span>Total Paid<\/span>/,
  `{Number(inv.downpayment_applied) > 0 && (
              <div className="flex justify-between text-slate-600 font-medium text-sm">
                <span>Less: Downpayment</span>
                <span>₱{Number(inv.downpayment_applied).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 font-bold text-sm">
              <span>Total Paid</span>`
);

fs.writeFileSync(path, content);
