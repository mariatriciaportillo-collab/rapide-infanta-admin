const fs = require('fs');
let path = 'src/app/(dashboard)/invoice/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace setInv(data) with setInv({ ...data }) to guarantee reference change
content = content.replace(/setInv\(data\)/, 'setInv({ ...data })');
fs.writeFileSync(path, content);

path = 'src/app/(dashboard)/quick-sale/[id]/page.tsx';
content = fs.readFileSync(path, 'utf8');
content = content.replace(/setSale\(data\)/, 'setSale({ ...data })');
fs.writeFileSync(path, content);
