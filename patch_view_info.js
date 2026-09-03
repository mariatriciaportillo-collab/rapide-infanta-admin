const fs = require('fs');

function compactViewInfo(filePath, isEstimate) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const regex = /\{\/\* Customer & Vehicle Info \*\/\}[\s\S]*?(?=\{\/\* Items Table \*\/|\{\/\* Action Bar \*\/)/;
  
  const replacement = `
        {/* Compact Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-white">
          
          {/* Customer */}
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              {isCompany ? <Building2 size={12} /> : <UserIcon size={12} />}
              {isCompany ? 'Company' : 'Customer'}
            </h3>
            <div className="text-slate-800 text-sm">
              <div className="font-bold text-base truncate">{${isEstimate ? 'estimate' : 'quote'}.customer_name}</div>
              {${isEstimate ? 'estimate' : 'quote'}.customer_telephone && <div className="text-slate-600 mt-0.5">{${isEstimate ? 'estimate' : 'quote'}.customer_telephone}</div>}
              {isCompany && ${isEstimate ? 'estimate' : 'quote'}.contact_person && <div className="text-slate-500 text-xs mt-0.5">Attn: {${isEstimate ? 'estimate' : 'quote'}.contact_person}</div>}
            </div>
          </div>
          
          {/* Vehicle */}
          <div className="p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Car size={12} />
              Vehicle
            </h3>
            <div className="text-slate-800 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase bg-slate-100 px-1.5 py-0.5 rounded text-xs border border-slate-200">{${isEstimate ? 'estimate' : 'quote'}.vehicle_plate}</span>
                <span className="font-medium truncate">{${isEstimate ? 'estimate' : 'quote'}.vehicle_make} {${isEstimate ? 'estimate' : 'quote'}.vehicle_model}</span>
              </div>
              <div className="text-slate-600 text-xs">Year: {${isEstimate ? 'estimate' : 'quote'}.vehicle_year || '-'}</div>
            </div>
          </div>
          
          {/* Service Details */}
          <div className="p-4 bg-slate-50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Service Details</h3>
            <div className="text-slate-800 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Advisor:</span>
                <span className="font-semibold">{${isEstimate ? 'estimate' : 'quote'}.service_advisor_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mechanic:</span>
                <span className="font-semibold">{${isEstimate ? 'estimate' : 'quote'}.mechanic_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mileage:</span>
                <span className="font-semibold">{${isEstimate ? 'estimate' : 'quote'}.mileage_km ? \`\${${isEstimate ? 'estimate' : 'quote'}.mileage_km.toLocaleString()} km\` : '-'}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Items Table */}
`;
  
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

compactViewInfo('src/app/(dashboard)/quotations/[id]/page.tsx', false);
compactViewInfo('src/app/(dashboard)/estimates/[id]/page.tsx', true);
