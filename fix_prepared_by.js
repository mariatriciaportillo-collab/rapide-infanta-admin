const fs = require('fs');

let form = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

form = form.replace(/useState\('Rapide Infanta Admin'\)/g, "useState('')");

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', form);
