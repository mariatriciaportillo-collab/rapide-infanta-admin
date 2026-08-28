const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

const bottomRegex = /<\/div>\s*<\/div>\s*\)\s*}/s;

const legalBlocks = `
        {/* Legal & Signatures */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-t border-slate-200">
          {/* Warranty Policy */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h3 className="font-bold text-slate-800 text-sm mb-3 uppercase border-b pb-2">THREE (3) MONTHS WARRANTY ON PARTS AND LABOR</h3>
            <div className="text-xs text-slate-600 space-y-2 text-justify">
              <p><strong>1.</strong> Any hidden or unforeseen defective parts and defects discovered while repairs are being performed are not included in the current quotation/estimate. Additional cost and continuation of additional repairs should require customer approval.</p>
              <p><strong>2.</strong> The price quotation is subject to change where applicable and is valid only for the specified quotation validity period.</p>
              <p><strong>3.</strong> MGP Auto Repair Center – Rapidé Infanta assumes no responsibility for loss or fire damage to the vehicle while it is placed in storage or under the shop's care for repairs, subject to the final approved business wording.</p>
            </div>
            
            {quote.warranty_terms && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="block font-bold text-slate-800 text-xs mb-1">WARRANTY TERMS</span>
                <span className="text-xs font-semibold text-amber-700">{quote.warranty_terms}</span>
              </div>
            )}
          </div>
          
          {/* Customer Authorization */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm mb-3 uppercase border-b pb-2">CUSTOMER AUTHORIZATION</h3>
            <p className="text-xs text-slate-600 text-justify mb-6">
              I hereby authorize and agree to pay for the repair work performed on my vehicle, including all authorized parts and materials necessary to complete the repairs. Payment shall be due in full upon completion of the repair work and notice that the vehicle is ready for release. In the event that the amount due remains unpaid, I acknowledge Rapidé Infanta's right, subject to applicable law, to retain possession of the vehicle until payment is made, demand and pursue collection of the unpaid amount, and exercise any mechanic's lien or other remedies available under Philippine law.
            </p>
            
            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex justify-between gap-8 pt-4">
                <div className="flex-1 text-center">
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="text-[10px] font-bold text-slate-800">APPROVED BY</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="text-[10px] font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}`;

if (!file.includes('CUSTOMER AUTHORIZATION')) {
  file = file.replace(bottomRegex, legalBlocks);
}

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
