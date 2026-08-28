const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

// 1. Inject @page { margin: 0 } CSS to remove browser headers/footers
const wrapperRegex = /(<div className="bg-white text-black min-h-screen w-full max-w-\[210mm\] mx-auto print:w-full print:max-w-none print:m-0 font-sans text-sm pb-10">)/;
file = file.replace(wrapperRegex, `$1
      <style dangerouslySetInnerHTML={{__html: \`
        @media print {
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
        }
      \`}} />`);

// Add print padding to compensate for margin:0
file = file.replace(/className="flex justify-between items-start pt-8 px-8 pb-6 border-b-2 border-slate-800"/, 'className="flex justify-between items-start pt-10 px-10 pb-4 border-b-2 border-slate-800 print:pt-12"');
file = file.replace(/px-6/g, 'px-10'); // all standard horizontal padding becomes px-10 for margins

// Fix the bottom area
const oldBottomStr = `      {/* Legal, Warranty, and Signatures */}
      <div className="mt-4 px-10 grid grid-cols-2 gap-4 page-break-inside-avoid">
        {/* Warranty Policy */}
        <div className="border border-slate-300 rounded p-3 flex flex-col">
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
        <div className="border border-slate-300 rounded p-3 flex flex-col">
          <h3 className="font-bold text-slate-800 text-xs mb-2 uppercase border-b border-slate-200 pb-1">CUSTOMER AUTHORIZATION</h3>
          <p className="text-[9px] text-slate-600 text-justify mb-4">
            I hereby authorize and agree to pay for the repair work performed on my vehicle, including all authorized parts and materials necessary to complete the repairs. Payment shall be due in full upon completion of the repair work and notice that the vehicle is ready for release. In the event that the amount due remains unpaid, I acknowledge Rapidé Infanta's right, subject to applicable law, to retain possession of the vehicle until payment is made, demand and pursue collection of the unpaid amount, and exercise any mechanic's lien or other remedies available under Philippine law.
          </p>
          
          <div className="mt-auto flex justify-between gap-6 pt-6">
            <div className="flex-1 text-center">
              <div className="border-b border-slate-800 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-800">APPROVED BY</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
            </div>
            <div className="flex-1 text-center">
              <div className="border-b border-slate-800 mb-1"></div>
              <p className="text-[9px] font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}`;

const newBottomStr = `      {/* Legal, Warranty, and Signatures */}
      <div className="mt-4 px-10 grid grid-cols-2 gap-4 page-break-inside-avoid">
        {/* Warranty Policy */}
        <div className="border border-slate-300 rounded p-3 flex flex-col">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase border-b border-slate-200 pb-1">THREE (3) MONTHS WARRANTY ON PARTS AND LABOR</h3>
          <div className="text-[8px] text-slate-600 space-y-1 text-justify">
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
        <div className="border border-slate-300 rounded p-3 flex flex-col">
          <h3 className="font-bold text-slate-800 text-[10px] mb-1 uppercase border-b border-slate-200 pb-1">CUSTOMER AUTHORIZATION</h3>
          <p className="text-[8px] text-slate-600 text-justify">
            I hereby authorize and agree to pay for the repair work performed on my vehicle, including all authorized parts and materials necessary to complete the repairs. Payment shall be due in full upon completion of the repair work and notice that the vehicle is ready for release. In the event that the amount due remains unpaid, I acknowledge Rapidé Infanta's right, subject to applicable law, to retain possession of the vehicle until payment is made, demand and pursue collection of the unpaid amount, and exercise any mechanic's lien or other remedies available under Philippine law.
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-6 px-16 flex justify-between gap-16 page-break-inside-avoid pb-8">
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1"></div>
          <p className="text-[9px] font-bold text-slate-800">APPROVED BY</p>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
        </div>
        <div className="flex-1 text-center">
          <div className="border-b border-slate-800 mb-1"></div>
          <p className="text-[9px] font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
        </div>
      </div>
    </div>
  )
}`;

// Note: the replace above will only work if exact string match!
// Let's use Regex to be safe.
const bottomRegex = /\{\/\* Legal, Warranty, and Signatures \*\/\}[\s\S]*\}\s*<\/div>\s*<\/div>\s*\)\s*}/;
file = file.replace(bottomRegex, newBottomStr);

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
