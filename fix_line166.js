const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

file = file.replace(/id: idMap\.get\(item\.id\),\s*description: item\.description \|\| '',/, 'id: item.id,\n          description: item.description || \'\',');

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
