const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

// The bottom of the file we want to replace starts with: {/* Legal, Warranty, and Signatures */}
// We will substring from there to the end.
const splitIndex = file.indexOf('{/* Legal, Warranty, and Signatures */}');
if (splitIndex !== -1) {
  const newBottom = `{/* Legal, Warranty, and Signatures */}
      <div className="mt-4 px-8 grid grid-cols-2 gap-4 page-break-inside-avoid">
        {/* Warranty Policy */}
        <div className="border border-slate-300 rounded p-3 flex flex-col bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase border-b border-slate-200 pb-1">THREE (3) MONTHS WARRANTY ON PARTS AND LABOR</h3>
          <div className="text-[8px] text-slate-600 space-y-1 text-justify leading-tight">
            <p><strong>1.</strong> Any hidden or unforeseen defective parts and defects discovered while repairs are being performed are not included in the current quotation/estimate. Additional cost and continuation of additional repairs should require customer approval.</p>
            <p><strong>2.</strong> The price quotation is subject to change where applicable and is valid only for the specified quotation validity period.</p>
            <p><strong>3.</strong> MGP Auto Repair Center – Rapidé Infanta assumes no responsibility for loss or fire damage to the vehicle while it is placed in storage or under the shop's care for repairs, subject to the final approved business wording.</p>
          </div>
          
          {quote.warranty_terms && (
            <div className="mt-auto pt-2 border-t border-slate-200">
              <span className="block font-bold text-slate-800 text-[9px] mb-0.5">WARRANTY TERMS</span>
              <span className="text-[9px] font-bold text-slate-700">{quote.warranty_terms}</span>
            </div>
          )}
        </div>
        
        {/* Customer Authorization */}
        <div className="border border-slate-300 rounded p-3 flex flex-col bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase border-b border-slate-200 pb-1">CUSTOMER AUTHORIZATION</h3>
          <p className="text-[8px] text-slate-600 text-justify leading-tight">
            I hereby authorize and agree to pay for the repair work performed on my vehicle, including all authorized parts and materials necessary to complete the repairs. Payment shall be due in full upon completion of the repair work and notice that the vehicle is ready for release. In the event that the amount due remains unpaid, I acknowledge Rapidé Infanta's right, subject to applicable law, to retain possession of the vehicle until payment is made, demand and pursue collection of the unpaid amount, and exercise any mechanic's lien or other remedies available under Philippine law.
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-6 px-16 flex justify-between gap-16 page-break-inside-avoid pb-8">
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[9px] font-bold text-slate-800">APPROVED BY</p>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1 h-8"></div>
          <p className="text-[9px] font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
        </div>
      </div>
    </div>
  )
}`;
  file = file.substring(0, splitIndex) + newBottom;
}

// Global compacting of print layout
file = file.replace(/px-10/g, 'px-8');
file = file.replace(/space-y-3/g, 'space-y-2');
file = file.replace(/space-y-4/g, 'space-y-2');
file = file.replace(/pt-10 px-10 pb-4/g, 'pt-6 px-8 pb-3');
file = file.replace(/print:pt-12/g, 'print:pt-6');
file = file.replace(/mt-4/g, 'mt-3');
file = file.replace(/mb-4/g, 'mb-2');
file = file.replace(/mb-8/g, 'mb-3');
file = file.replace(/p-8/g, 'p-6');
file = file.replace(/py-1/g, 'py-0');
file = file.replace(/gap-8/g, 'gap-4');
file = file.replace(/h-16/g, 'h-10'); // For Prepared By spacing
file = file.replace(/pt-4/g, 'pt-2'); 

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
