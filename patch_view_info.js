const fs = require('fs');

function compactView(filePath, isEstimate) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace from {/* Customer & Vehicle Info */} to just before {/* Line Items Table */}
  const regex = /\{\/\* Customer & Vehicle Info \*\/\}[\s\S]*?(?=\{\/\* Line Items Table \*\/)/;
  
  const newHeader = `{/* Compact Customer & Vehicle Info */}
        <div className="bg-white border-b border-slate-200">
          <div className="grid grid-cols-2 divide-x divide-slate-100 p-4">
            {/* Quoted To */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />}
                {isEstimate ? 'Estimate For' : 'Quoted To'}
              </h3>
              <div className="text-slate-800 text-sm leading-snug">
                <div className="font-bold text-base">{${isEstimate ? 'estimate' : 'quote'}.customer_name}</div>
                {${isEstimate ? 'estimate' : 'quote'}.customer_telephone && <div className="text-slate-600 mt-0.5">{${isEstimate ? 'estimate' : 'quote'}.customer_telephone}</div>}
                {isCompany && ${isEstimate ? 'estimate' : 'quote'}.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {${isEstimate ? 'estimate' : 'quote'}.contact_person}</div>}
              </div>
            </div>
            
            {/* Vehicle Details */}
            <div className="pl-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Car size={12} />
                Vehicle Details
              </h3>
              <div className="text-slate-800 text-sm space-y-1">
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Plate:</span><span className="font-medium uppercase">{${isEstimate ? 'estimate' : 'quote'}.vehicle_plate}</span></div>
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Model:</span><span className="font-medium">{${isEstimate ? 'estimate' : 'quote'}.vehicle_make} {${isEstimate ? 'estimate' : 'quote'}.vehicle_model}</span></div>
                <div><span className="text-slate-500 mr-2 w-10 inline-block">Year:</span><span className="font-medium">{${isEstimate ? 'estimate' : 'quote'}.vehicle_year || '-'}</span></div>
              </div>
            </div>
          </div>
          
          {/* Service Details Strip */}
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex gap-8 text-sm">
            <div><span className="text-slate-500 font-medium mr-2">Service Advisor:</span><span className="font-bold text-slate-800">{${isEstimate ? 'estimate' : 'quote'}.service_advisor_name || '-'}</span></div>
            <div><span className="text-slate-500 font-medium mr-2">Mechanic:</span><span className="font-bold text-slate-800">{${isEstimate ? 'estimate' : 'quote'}.mechanic_name || '-'}</span></div>
            <div><span className="text-slate-500 font-medium mr-2">Mileage:</span><span className="font-bold text-slate-800">{${isEstimate ? 'estimate' : 'quote'}.mileage_km ? \`\${${isEstimate ? 'estimate' : 'quote'}.mileage_km.toLocaleString()} km\` : '-'}</span></div>
          </div>
        </div>

        `;

  content = content.replace(regex, newHeader);
  
  // Let's also reduce global spacing: pb-24 -> pb-8, p-6 -> p-4.
  content = content.replace(/className="pb-24/g, 'className="pb-8');
  content = content.replace(/p-8/g, 'p-4');
  content = content.replace(/p-6/g, 'p-4');
  
  fs.writeFileSync(filePath, content);
}

compactView('src/app/(dashboard)/quotations/[id]/page.tsx', false);
compactView('src/app/(dashboard)/estimates/[id]/page.tsx', true);
