const fs = require('fs');
const filePath = 'src/app/(dashboard)/estimates/[id]/print/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The bottom area currently looks like:
/*
      {/* Footer *\/}
      <div className="mt-3 px-8 pt-2 border-t-2 border-slate-800 flex justify-between gap-6 page-break-inside-avoid">
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Notes / Remarks</h4>
            <p className="text-slate-600 text-xs whitespace-pre-wrap">{estimate.notes || 'None'}</p>
          </div>
          
        </div>
        
        
      </div>

      {/* Legal and Signatures *\/}
      <div className="mt-4 px-8 grid grid-cols-2 gap-8 page-break-inside-avoid pb-6">
        {/* Left Column: PLEASE READ Notice *\/}
*/

const oldRegex = /\{\/\* Footer \*\/\}[\s\S]*?(?=\<\/div>\n\s*\)\n\})/m;

const newBottom = `{/* Footer, Legal, and Signatures */}
      <div className="mt-2 px-8 pt-2 border-t-2 border-slate-800 grid grid-cols-2 gap-8 page-break-inside-avoid pb-4">
        
        {/* Left Column: Notes & Please Read */}
        <div className="col-span-1 space-y-3">
          {/* Notes / Remarks */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-0.5">Notes / Remarks</h4>
            <p className="text-slate-600 text-[10px] leading-tight whitespace-pre-wrap">{estimate.notes || 'None'}</p>
          </div>
          
          {/* PLEASE READ Notice */}
          <div>
            <h3 className="font-bold text-slate-800 text-[10px] mb-0.5 uppercase tracking-wider">PLEASE READ</h3>
            <p className="text-[9px] text-slate-600 text-justify leading-snug">
              Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
            </p>
          </div>
        </div>

        {/* Right Column: Signatures */}
        <div className="col-span-1 flex flex-col justify-between gap-4">
          
          {/* Upper Right: PREPARED BY */}
          <div className="flex flex-col text-center w-full max-w-[200px] ml-auto mt-2">
            <div className="border-b border-slate-800 mb-0.5 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase truncate leading-tight">{estimate.prepared_by}</p>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">PREPARED BY</p>
          </div>

          {/* Lower Right: CUSTOMER SIGNATURE */}
          <div className="flex flex-col text-center w-full max-w-[200px] ml-auto mt-2">
            <div className="border-b border-slate-800 mb-0.5 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase leading-tight">CUSTOMER'S SIGNATURE</p>
            <p className="text-[8px] text-slate-400 mt-0.5 leading-tight">Customer Signature & Date/Time</p>
          </div>
          
        </div>
      </div>
    `;

content = content.replace(oldRegex, newBottom);
fs.writeFileSync(filePath, content);
