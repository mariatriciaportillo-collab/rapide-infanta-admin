const fs = require('fs');
const path = 'src/components/payments/PaymentReceipt.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="max-w-3xl mx-auto flex justify-end mb-4 print:hidden">/,
  `<div className="max-w-3xl mx-auto flex justify-between mb-4 print:hidden">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-md font-medium transition"
        >
          ← Back
        </button>`
);

fs.writeFileSync(path, content);
