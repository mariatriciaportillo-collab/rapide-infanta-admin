const fs = require('fs');

function patchEstimatePrint(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Patch Bottom Signatures Area
  const bottomRegex = /\{\/\* Legal and Signatures \*\/\}[\s\S]*?(?=\<\/div>\n\s*\)\n\})/m;
  
  const newBottom = `{/* Legal and Signatures */}
      <div className="mt-4 px-8 grid grid-cols-2 gap-8 page-break-inside-avoid pb-6">
        {/* Left Column: PLEASE READ Notice */}
        <div className="col-span-1">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase tracking-wider">PLEASE READ</h3>
          <p className="text-[9px] text-slate-600 text-justify leading-snug">
            Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
          </p>
        </div>

        {/* Right Column: Signatures */}
        <div className="col-span-1 flex flex-col justify-between gap-6">
          {/* Upper Right: PREPARED BY */}
          <div className="flex flex-col text-center w-3/4 ml-auto">
            <div className="border-b border-slate-800 mb-1 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase truncate px-1">{estimate.prepared_by}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">PREPARED BY</p>
          </div>

          {/* Lower Right: CUSTOMER SIGNATURE */}
          <div className="flex flex-col text-center w-3/4 ml-auto">
            <div className="border-b border-slate-800 mb-1 h-6"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase">&nbsp;</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">CUSTOMER'S SIGNATURE</p>
            <p className="text-[8px] text-slate-400 mt-0.5">Customer Signature & Date/Time</p>
          </div>
        </div>
      </div>
    `;

  content = content.replace(bottomRegex, newBottom);

  // 2. Patch Plate Number styling
  const plateRegex = /<span className="font-bold uppercase bg-slate-100 border border-slate-200 px-1 rounded text-xs">\{estimate\.vehicle_plate\}<\/span>/;
  const newPlate = `<span className="font-medium uppercase">{estimate.vehicle_plate}</span>`;
  
  content = content.replace(plateRegex, newPlate);

  fs.writeFileSync(filePath, content);
}

function patchQuotationPrint(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Patch Plate Number styling to match Make/Model
  const plateRegex = /<span className="font-bold uppercase">\{quote\.vehicle_plate\}<\/span>/;
  const newPlate = `<span className="font-medium uppercase">{quote.vehicle_plate}</span>`;
  
  content = content.replace(plateRegex, newPlate);
  fs.writeFileSync(filePath, content);
}

patchEstimatePrint('src/app/(dashboard)/estimates/[id]/print/page.tsx');
patchQuotationPrint('src/app/(dashboard)/quotations/[id]/print/page.tsx');
