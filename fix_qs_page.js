const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/quick-sale/page.tsx', 'utf8');
c = c.replace(/\$\{text-\[10px\] \$\{badgeClass\}\}/g, '${badgeClass}');
fs.writeFileSync('src/app/(dashboard)/quick-sale/page.tsx', c);
