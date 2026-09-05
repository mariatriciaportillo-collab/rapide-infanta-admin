const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/service-history/page.tsx', 'utf8');
c = c.replace(/\{\/\* oil_type \*\/\}.*\}/g, '');
fs.writeFileSync('src/app/(dashboard)/service-history/page.tsx', c);
