const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

file = file.replace(/<h2 className="text-3xl font-bold text-slate-800">\{isEditingQuote \? "Edit Quotation" : "New Quotation"\}<\/h2>/, '<div className="flex items-center gap-4"><img src="/rapide-logo.png" alt="Rapidé" className="h-10 w-auto object-contain" /><h2 className="text-3xl font-bold text-slate-800">{isEditingQuote ? "Edit Quotation" : "New Quotation"}</h2></div>');

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
