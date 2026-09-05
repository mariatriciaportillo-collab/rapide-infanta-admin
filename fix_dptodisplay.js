const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/payments/page.tsx', 'utf8');

c = c.replace(/downpayments\.map\(q =>/g, "dpToDisplay.map(q =>");

fs.writeFileSync('src/app/(dashboard)/payments/page.tsx', c);
