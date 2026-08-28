const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

const topBlocksRegex = /(<div className="flex border-b border-slate-300">)[\s\S]+?(<\/div>\s*<\/div>\s*<\/div>)/;

const topBlocksNew = `<div className="flex border-b border-slate-300">
        {/* Bill To */}
        <div className="w-1/3 p-4 border-r border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quoted To</h3>
          <div className="space-y-0.5 text-slate-800 text-sm">
            <div className="font-bold text-base">{quote.customer_name}</div>
            
            {isCompany && quote.contact_person && (
              <div className="text-slate-600">Attn: {quote.contact_person}</div>
            )}
            
            {quote.customer_telephone && (
              <div>{quote.customer_telephone}</div>
            )}
            
            {quote.customer_email && <div>{quote.customer_email}</div>}
            {quote.customer_address && <div>{quote.customer_address}</div>}
            
            {isCompany && quote.customer_tin && (
              <div className="pt-1 font-medium">TIN: {quote.customer_tin}</div>
            )}
          </div>
        </div>
        
        {/* Vehicle */}
        <div className="w-1/3 p-4 border-r border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Details</h3>
          <div className="space-y-1 text-slate-800 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plate:</span>
              <span className="font-bold uppercase">{quote.vehicle_plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model:</span>
              <span className="font-medium">{quote.vehicle_make} {quote.vehicle_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Year:</span>
              <span className="font-medium">{quote.vehicle_year || '-'}</span>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="w-1/3 p-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Service Details</h3>
          <div className="space-y-1 text-slate-800 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Service Advisor:</span>
              <span className="font-semibold text-right">{quote.service_advisor_name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mechanic:</span>
              <span className="font-semibold text-right">{quote.mechanic_name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mileage:</span>
              <span className="font-medium">{quote.mileage_km ? \`\${quote.mileage_km.toLocaleString()} km\` : '-'}</span>
            </div>
          </div>
        </div>
      </div>`;

if (!file.includes('Service Advisor:')) {
  file = file.replace(topBlocksRegex, topBlocksNew);
}

const bottomRegex = /{\/\* Disclaimer \/ Signature \*\/}?(?:.*?\n)*?(\s*)<\/div>\s*\)\s*}/s;

const bottomNew = `{/* Legal, Warranty, and Signatures */}
      <div className="mt-8 px-6 grid grid-cols-2 gap-8 page-break-inside-avoid">
        {/* Warranty Policy */}
        <div className="border border-slate-300 rounded p-4 flex flex-col">
          <h3 className="font-bold text-slate-800 text-xs mb-2 uppercase border-b border-slate-200 pb-1">THREE (3) MONTHS WARRANTY ON PARTS AND LABOR</h3>
          <div className="text-[9px] text-slate-600 space-y-1.5 text-justify">
            <p><strong>1.</strong> Any hidden or unforeseen defective parts and defects discovered while repairs are being performed are not included in the current quotation/estimate. Additional cost and continuation of additional repairs should require customer approval.</p>
            <p><strong>2.</strong> The price quotation is subject to change where applicable and is valid only for the specified quotation validity period.</p>
            <p><strong>3.</strong> MGP Auto Repair Center – Rapidé Infanta assumes no responsibility for loss or fire damage to the vehicle while it is placed in storage or under the shop's care for repairs, subject to the final approved business wording.</p>
          </div>
          
          {quote.warranty_terms && (
            <div className="mt-auto pt-3 border-t border-slate-200">
              <span className="block font-bold text-slate-800 text-[10px] mb-0.5">WARRANTY TERMS</span>
              <span className="text-[10px] font-bold text-slate-700">{quote.warranty_terms}</span>
            </div>
          )}
        </div>
        
        {/* Customer Authorization */}
        <div className="border border-slate-300 rounded p-4 flex flex-col">
          <h3 className="font-bold text-slate-800 text-xs mb-2 uppercase border-b border-slate-200 pb-1">CUSTOMER AUTHORIZATION</h3>
          <p className="text-[9px] text-slate-600 text-justify mb-8">
            I hereby authorize and agree to pay for the repair work performed on my vehicle, including all authorized parts and materials necessary to complete the repairs. Payment shall be due in full upon completion of the repair work and notice that the vehicle is ready for release. In the event that the amount due remains unpaid, I acknowledge Rapidé Infanta's right, subject to applicable law, to retain possession of the vehicle until payment is made, demand and pursue collection of the unpaid amount, and exercise any mechanic's lien or other remedies available under Philippine law.
          </p>
          
          <div className="mt-auto flex justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="border-b border-slate-800 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Customer Name / Signature</p>
            </div>
            <div className="w-24 text-center">
              <div className="border-b border-slate-800 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Date</p>
            </div>
          </div>
        </div>
      </div>$1</div>\n  )\n}`;

if (!file.includes('CUSTOMER AUTHORIZATION')) {
  file = file.replace(bottomRegex, bottomNew);
}

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
