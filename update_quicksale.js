const fs = require('fs');

let path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');
let newTotals = `
          <div className="flex justify-between text-slate-600 text-sm">
            <span>Subtotal</span>
            <span>₱{Number(sale.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
          {Number(sale.discount_amount) > 0 && (
            <div className="flex justify-between text-emerald-600 text-sm font-medium">
              <span>Discount</span>
              <span>- ₱{Number(sale.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          )}
          <div className="h-px bg-slate-200 my-1"></div>
          <div className="flex justify-between items-end text-slate-900 font-bold">
            <span className="text-sm uppercase tracking-wider">Grand Total</span>
            <span className="text-2xl tracking-tight">₱{Math.max(0, Number(sale.subtotal) - Number(sale.discount_amount || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
`;
content = content.replace(
  /<div className="flex justify-between text-slate-600 text-sm">\n\s*<span>Subtotal<\/span>[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>/,
  newTotals.trim()
);
fs.writeFileSync(path, content);


path = 'src/app/(dashboard)/quick-sale/[id]/print/page.tsx';
content = fs.readFileSync(path, 'utf8');
newTotals = `
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Subtotal</span>
              <span>₱{Number(sale.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            {Number(sale.discount_amount) > 0 && (
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Discount</span>
                <span>- ₱{Number(sale.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="h-0.5 bg-slate-800 my-1"></div>
            <div className="flex justify-between text-slate-900 font-bold text-lg">
              <span>Grand Total</span>
              <span>₱{Math.max(0, Number(sale.subtotal) - Number(sale.discount_amount || 0)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
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
