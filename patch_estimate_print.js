const fs = require('fs');

const filePath = 'src/app/(dashboard)/estimates/[id]/print/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Service Details from Top Area
// The structure in the file currently (from my previous patch or as it is):
// It might be a 3-column grid or have Service Details.
// Let's replace the grid block for the Top Info Area.

const topInfoRegex = /\{\/\* Customer & Vehicle Info \*\/\}[\s\S]*?(?=\{\/\* Items Table \*\/|\{\/\* PACKAGES \*\/)/;
const newTopInfo = `{/* Top Information Summary */}
      <div className="grid grid-cols-2 divide-x divide-slate-200 border-b-2 border-slate-800 mb-6 pb-4">
        {/* Quoted To */}
        <div className="pr-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quoted To</h3>
          <div className="text-slate-800 text-sm">
            <div className="font-bold text-base">{estimate.customer_name}</div>
            {estimate.customer_telephone && <div className="text-slate-600 mt-0.5">{estimate.customer_telephone}</div>}
            {isCompany && estimate.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {estimate.contact_person}</div>}
          </div>
        </div>
        
        {/* Vehicle Details */}
        <div className="pl-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vehicle Details</h3>
          <div className="text-slate-800 text-sm space-y-1">
            <div><span className="text-slate-500 font-medium mr-2">Plate Number:</span><span className="font-bold uppercase">{estimate.vehicle_plate}</span></div>
            <div><span className="text-slate-500 font-medium mr-2">Make / Model:</span><span className="font-medium">{estimate.vehicle_make} {estimate.vehicle_model}</span></div>
            <div><span className="text-slate-500 font-medium mr-2">Year:</span><span className="font-medium">{estimate.vehicle_year || '-'}</span></div>
          </div>
        </div>
      </div>

      `;

content = content.replace(topInfoRegex, newTopInfo);

// 2. Fix the Bottom Section (PLEASE READ, PREPARED BY, SIGNATURE)
// It starts around {/* Legal, Warranty, and Signatures */} or {/* Footer */}
const bottomRegex = /\{\/\* Legal, Warranty, and Signatures \*\/\}[\s\S]*?(?=\<\/div>\n\s*\)\n\})/m;
const newBottom = `{/* Legal and Signatures */}
      <div className="mt-6 pt-4 border-t-2 border-slate-800 grid grid-cols-3 gap-6 page-break-inside-avoid pb-8">
        {/* PLEASE READ Notice */}
        <div className="col-span-1">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase tracking-wider">PLEASE READ</h3>
          <p className="text-[9px] text-slate-600 text-justify leading-snug">
            Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
          </p>
        </div>

        {/* PREPARED BY */}
        <div className="col-span-1 flex flex-col justify-end text-center pb-2">
          <div className="border-b border-slate-800 mb-1 h-6"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">{estimate.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">PREPARED BY</p>
        </div>

        {/* CUSTOMER SIGNATURE */}
        <div className="col-span-1 flex flex-col justify-end text-center pb-2">
          <div className="border-b border-slate-800 mb-1 h-6"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">CUSTOMER SIGNATURE & DATE/TIME</p>
        </div>
      </div>
    `;

content = content.replace(bottomRegex, newBottom);

fs.writeFileSync(filePath, content);
