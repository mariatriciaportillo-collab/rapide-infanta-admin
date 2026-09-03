const fs = require('fs');
const path = 'src/app/(dashboard)/quick-sale/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/s\.status === 'COMPLETED'/g, "s.status === 'UNPAID' || s.status === 'PAID'");
fs.writeFileSync(path, content);
