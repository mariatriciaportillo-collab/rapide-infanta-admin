const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

// Replace exactly inside the map block
file = file.replace(/id: item\.id,(\s*quotation_id: quote\.id)/, 'id: idMap.get(item.id) as string,$1');

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
