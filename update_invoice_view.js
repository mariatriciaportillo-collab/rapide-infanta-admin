const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newTotals = `
          <div className="flex justify-between text-slate-600 text-sm">
            <span>Subtotal</span>
            <span>₱{Number(inv.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          {Number(inv.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-600 text-sm font-medium">
              <span>Discount</span>
              <span>- ₱{Number(inv.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          )}
          {Number(inv.downpayment_applied) > 0 && (
            <div className="flex justify-between text-blue-600 text-sm font-medium">
              <span>Downpayment</span>
              <span>- ₱{Number(inv.downpayment_applied).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          )}
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex justify-between items-end text-slate-900 font-bold">
            <span className="text-sm uppercase tracking-wider">Grand Total</span>
            <span className="text-2xl tracking-tight">₱{Math.max(0, Number(inv.subtotal) - Number(inv.discount_amount || 0) - Number(inv.downpayment_applied || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
`;

content = content.replace(
  /<div className="flex justify-between text-slate-600 text-sm">\n\s*<span>Subtotal<\/span>[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>/,
  newTotals.trim()
);

fs.writeFileSync(path, content);
