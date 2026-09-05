const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/payments/page.tsx', 'utf8');

c = c.replace(/\`\), \{ count: 'exact' \}/g, "`, { count: 'exact' })");

fs.writeFileSync('src/app/(dashboard)/payments/page.tsx', c);
console.log('Fixed payments syntax');
