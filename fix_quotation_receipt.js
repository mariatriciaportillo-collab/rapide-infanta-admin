const fs = require('fs');
let path = 'src/app/(dashboard)/quotations/[id]/receipt/page.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync(path, content);
