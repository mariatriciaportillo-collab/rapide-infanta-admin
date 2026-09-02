const fs = require('fs');

let file = fs.readFileSync('src/app/(dashboard)/estimate/[id]/print/page.tsx', 'utf8');

const regex = /\{\/\* Warranty Policy \*\/\}(.|\n)*\{\/\* Signatures \*\/\}/m;
const replacement = `{/* PLEASE READ Notice */}
        <div className="border border-slate-300 rounded p-4 flex flex-col bg-slate-50/50 md:col-span-2">
          <h3 className="font-bold text-slate-800 text-[11px] mb-2 uppercase border-b border-slate-200 pb-1 tracking-wider">PLEASE READ</h3>
          <p className="text-[9px] text-slate-700 text-justify leading-relaxed">
            Under MAP Uniform Inspection Guidelines, we are required to document all our findings on your vehicle. This is your estimate. Our Store Manager should bring you to your car, show you the needed repairs and go over the estimate with you, item by item. All your questions should be answered. We want you to know all your options. This is your car. We want to help you keep it in good running condition.
          </p>
        </div>
      </div>

      {/* Signatures */}`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/app/(dashboard)/estimate/[id]/print/page.tsx', file);
