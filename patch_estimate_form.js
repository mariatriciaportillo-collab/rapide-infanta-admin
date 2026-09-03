const fs = require('fs');

let file = fs.readFileSync('src/components/estimates/EstimateForm.tsx', 'utf8');

// Remove warranty state
file = file.replace(/const \[warranty, setWarranty\] = useState\('3 Months \/ 5,000km \(Whichever comes first\)'\)\n/g, '');
// Remove initialData load
file = file.replace(/setWarranty\(initialData\.warranty_terms \|\| ''\)\n/g, '');
// Remove from payload
file = file.replace(/warranty_terms: warranty,\n/g, '');
// Remove from UI
const uiRegex = /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Warranty Terms<\/label>\s*<input type="text" value=\{warranty\} onChange=\{e => setWarranty\(e\.target\.value\)\} className="w-full border border-slate-300 rounded-md p-2" \/>\s*<\/div>/g;
file = file.replace(uiRegex, '');

fs.writeFileSync('src/components/estimates/EstimateForm.tsx', file);
