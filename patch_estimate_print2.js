const fs = require('fs');
const filePath = 'src/app/(dashboard)/estimates/[id]/print/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* Two-column info \*\/\}[\s\S]*?(?=\{\/\* Items Table \*\/)/;

const newTop = `{/* Top Information Summary */}
      <div className="grid grid-cols-2 divide-x divide-slate-300 border-b border-slate-300">
        {/* Quoted To */}
        <div className="p-4 pl-8">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quoted To</h3>
          <div className="text-slate-800 text-sm leading-snug">
            <div className="font-bold text-base">{estimate.customer_name}</div>
            {estimate.customer_telephone && <div className="text-slate-600 mt-0.5">{estimate.customer_telephone}</div>}
            {isCompany && estimate.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {estimate.contact_person}</div>}
          </div>
        </div>
        
        {/* Vehicle Details */}
        <div className="p-4 pr-8 pl-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Details</h3>
          <div className="text-slate-800 text-sm space-y-1">
            <div className="flex gap-2 items-center">
              <span className="text-slate-500 font-medium w-12">Plate:</span>
              <span className="font-bold uppercase bg-slate-100 border border-slate-200 px-1 rounded text-xs">{estimate.vehicle_plate}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 font-medium w-12">Model:</span>
              <span className="font-medium">{estimate.vehicle_make} {estimate.vehicle_model}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 font-medium w-12">Year:</span>
              <span className="font-medium">{estimate.vehicle_year || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      `;

content = content.replace(regex, newTop);

// Now for the bottom section
// The bottom section is:
/*
      {/* Legal, Warranty, and Signatures *\/}
      <div className="mt-3 px-8 grid grid-cols-2 gap-4 page-break-inside-avoid">
        {/* PLEASE READ Notice *\/}
        <div className="border border-slate-300 rounded p-4 flex flex-col bg-slate-50/50 md:col-span-2">
          <h3 className="font-bold text-slate-800 text-[11px] mb-2 uppercase border-b border-slate-200 pb-1 tracking-wider">PLEASE READ</h3>
          <p className="text-[9px] text-slate-700 text-justify leading-relaxed">
            Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
          </p>
        </div>
      </div>

      {/* Signatures *\/}
      <div className="mt-6 px-16 flex justify-between gap-16 page-break-inside-avoid pb-8">
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">{estimate.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">PREPARED BY</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">CUSTOMER'S SIGNATURE</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">CUSTOMER SIGNATURE & DATE/TIME</p>
        </div>
      </div>
*/

const bottomRegex = /\{\/\* Legal, Warranty, and Signatures \*\/\}[\s\S]*?(?=\<\/div>\n\s*\)\n\})/m;

const newBottom = `{/* Legal and Signatures */}
      <div className="mt-6 px-8 flex gap-6 page-break-inside-avoid pb-6">
        {/* PLEASE READ Notice */}
        <div className="w-1/2">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase tracking-wider">PLEASE READ</h3>
          <p className="text-[9px] text-slate-600 text-justify leading-snug">
            Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
          </p>
        </div>

        {/* PREPARED BY */}
        <div className="w-1/4 flex flex-col justify-end text-center">
          <div className="border-b border-slate-800 mb-1 h-6"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase truncate px-1">{estimate.prepared_by}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">PREPARED BY</p>
        </div>

        {/* CUSTOMER SIGNATURE */}
        <div className="w-1/4 flex flex-col justify-end text-center">
          <div className="border-b border-slate-800 mb-1 h-6"></div>
          <p className="text-[10px] font-bold text-slate-800 uppercase">&nbsp;</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">CUSTOMER'S SIGNATURE</p>
        </div>
      </div>
    `;

content = content.replace(bottomRegex, newBottom);
fs.writeFileSync(filePath, content);
