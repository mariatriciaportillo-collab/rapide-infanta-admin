const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

const oldAuthBlockRegex = /<div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col">\s*<h3 className="font-bold text-slate-800 text-sm mb-3 uppercase border-b pb-2">CUSTOMER AUTHORIZATION<\/h3>\s*<p className="text-xs text-slate-600 text-justify mb-6">\s*I hereby authorize.*?\s*<\/p>\s*<div className="mt-auto pt-6 border-t border-slate-100">\s*<div className="flex justify-between gap-8 pt-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*}/;

const newAuthBlock = `<div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm mb-3 uppercase border-b pb-2">CUSTOMER AUTHORIZATION</h3>
            <p className="text-xs text-slate-600 text-justify">
              I hereby authorize and agree to pay for the repair work performed on my vehicle, including all authorized parts and materials necessary to complete the repairs. Payment shall be due in full upon completion of the repair work and notice that the vehicle is ready for release. In the event that the amount due remains unpaid, I acknowledge Rapidé Infanta's right, subject to applicable law, to retain possession of the vehicle until payment is made, demand and pursue collection of the unpaid amount, and exercise any mechanic's lien or other remedies available under Philippine law.
            </p>
          </div>
        </div>
        
        {/* Signatures */}
        <div className="mt-8 px-16 flex justify-between gap-16 pb-12">
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1"></div>
            <p className="text-xs font-bold text-slate-800">APPROVED BY</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized Representative</p>
          </div>
          <div className="flex-1 text-center">
            <div className="border-b border-slate-800 mb-1"></div>
            <p className="text-xs font-bold text-slate-800">CUSTOMER'S SIGNATURE</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Customer Signature & Date/Time</p>
          </div>
        </div>

      </div>
    </div>
  )
}`;

file = file.replace(oldAuthBlockRegex, newAuthBlock);
fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
