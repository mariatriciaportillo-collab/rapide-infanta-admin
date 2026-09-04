const fs = require('fs');
const path = 'src/app/(dashboard)/invoice/[id]/print/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const newTotals = `
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal</span>
              <span>₱{Number(inv.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            {Number(inv.discount_amount) > 0 && (
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Discount</span>
                <span>- ₱{Number(inv.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            {Number(inv.downpayment_applied) > 0 && (
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Downpayment</span>
                <span>- ₱{Number(inv.downpayment_applied).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="h-0.5 bg-slate-800 my-1"></div>
            <div className="flex justify-between text-slate-900 font-bold text-lg">
              <span>Grand Total</span>
              <span>₱{Math.max(0, Number(inv.subtotal) - Number(inv.discount_amount || 0) - Number(inv.downpayment_applied || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>
`;

content = content.replace(
  /<div className="flex justify-between text-slate-600 text-sm">\n\s*<span>Subtotal<\/span>[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/,
  newTotals.trim() + "\n"
);

fs.writeFileSync(path, content);
