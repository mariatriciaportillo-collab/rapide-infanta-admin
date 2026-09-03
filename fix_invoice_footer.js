const fs = require('fs');

function replaceFooter(filePath, isPrint = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to replace everything from "Footer" down to the end of the div
  // The structure is slightly different between Print and View.
  
  if (isPrint) {
    const footerRegex = /\{\/\* Footer, Legal, and Signatures \*\/\}\s*<div className="mt-4 px-8 pt-2 border-t-2 border-slate-800 grid grid-cols-2 gap-8 page-break-inside-avoid pb-4">[\s\S]*?<\/div>\s*<\/div>\s*\n  \)\n\}/;
    
    const newFooter = `{/* Footer */}
      <div className="mt-4 px-8 pt-2 border-t-2 border-slate-800 flex justify-between gap-6 page-break-inside-avoid">
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Notes / Remarks</h4>
            <p className="text-slate-600 text-[10px] whitespace-pre-wrap">{inv.notes || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-8 px-16 flex justify-between gap-16 page-break-inside-avoid pb-8">
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">{inv.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>
        </div>
      </div>
    </div>
  )
}`;
    content = content.replace(footerRegex, newFooter);
  } else {
    // For view page
    const viewFooterRegex = /\{\/\* Totals & Notes \*\/\}\s*<div className="border-t border-slate-200 pt-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Payment Modal \*\/\}/;
    
    const newViewFooter = `{/* Totals & Notes */}
      <div className="border-t border-slate-200 pt-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-2">Notes / Remarks</h4>
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 min-h-[100px]">
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{inv.notes || 'No notes provided.'}</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₱{Number(inv.subtotal).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            {Number(inv.discount_amount) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>- ₱{Number(inv.discount_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between items-end text-slate-900 font-bold mb-2">
              <span className="text-sm uppercase tracking-wider">Grand Total</span>
              <span className="text-lg">₱{Number(inv.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-end text-emerald-700 font-bold mb-2">
              <span className="text-sm uppercase tracking-wider">Total Paid</span>
              <span className="text-lg">₱{Number(inv.amount_paid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="border-t border-slate-300 pt-3 flex justify-between items-end text-red-600 font-bold">
              <span className="text-sm uppercase tracking-wider">Balance Due</span>
              <span className="text-2xl tracking-tight">₱{Number(inv.balance_due ?? inv.grand_total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Signatures */}
      <div className="mt-12 px-16 flex justify-between gap-16 pb-8">
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">{inv.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>
        </div>
      </div>
      
    </div>
    
    {/* Payment Modal */}`;
    content = content.replace(viewFooterRegex, newViewFooter);
  }

  fs.writeFileSync(filePath, content);
}

replaceFooter('src/app/(dashboard)/invoice/[id]/print/page.tsx', true);
replaceFooter('src/app/(dashboard)/invoice/[id]/page.tsx', false);

