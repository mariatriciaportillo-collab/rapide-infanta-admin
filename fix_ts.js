const fs = require('fs');
let file = fs.readFileSync('src/components/quotations/QuotationForm.tsx', 'utf8');

file = file.replace(/let activeAdvisors = \[\];/g, 'let activeAdvisors: any[] = [];');
file = file.replace(/let activeMechanics = \[\];/g, 'let activeMechanics: any[] = [];');

fs.writeFileSync('src/components/quotations/QuotationForm.tsx', file);
