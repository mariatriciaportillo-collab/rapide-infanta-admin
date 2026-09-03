const fs = require('fs');

function compactViewSummary(filePath, isEstimate) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace everything from {/* Customer & Vehicle Info */} to the end of {/* Service Details */} block
  const regex = /\{\/\* Customer & Vehicle Info \*\/\}[\s\S]*?(?=\{\/\* Items Table \*\/)/;
  
  const replacement = `
        {/* Compact Summary Area */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-4">
          <div className="grid grid-cols-2 divide-x divide-slate-100 p-4">
            
            {/* Left: Quoted To */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />}
                {isEstimate ? 'Estimate For' : 'Quoted To'}
              </h3>
              <div className="text-slate-800 text-sm leading-snug">
                <div className="font-bold text-base">{${isEstimate ? 'estimate' : 'quote'}.customer_name}</div>
                {${isEstimate ? 'estimate' : 'quote'}.customer_telephone && <div className="text-slate-600">{${isEstimate ? 'estimate' : 'quote'}.customer_telephone}</div>}
                {isCompany && ${isEstimate ? 'estimate' : 'quote'}.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {${isEstimate ? 'estimate' : 'quote'}.contact_person}</div>}
              </div>
            </div>
            
            {/* Right: Vehicle Details */}
            <div className="pl-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Car size={12} />
                Vehicle Details
              </h3>
              <div className="text-slate-800 text-sm leading-snug">
                <div><span className="text-slate-500 mr-2">Plate Number:</span><span className="font-bold">{${isEstimate ? 'estimate' : 'quote'}.vehicle_plate}</span></div>
                <div><span className="text-slate-500 mr-2">Make / Model:</span><span className="font-medium">{${isEstimate ? 'estimate' : 'quote'}.vehicle_make} {${isEstimate ? 'estimate' : 'quote'}.vehicle_model}</span></div>
                <div><span className="text-slate-500 mr-2">Year:</span><span className="font-medium">{${isEstimate ? 'estimate' : 'quote'}.vehicle_year || '-'}</span></div>
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

        {/* Items Table */}
`;
  
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

compactViewSummary('src/app/(dashboard)/quotations/[id]/page.tsx', false);
compactViewSummary('src/app/(dashboard)/estimates/[id]/page.tsx', true);
