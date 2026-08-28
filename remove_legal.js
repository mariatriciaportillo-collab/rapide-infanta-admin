const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

const regex = /\{\/\* Legal & Signatures \*\/\}[\s\S]*?CUSTOMER'S SIGNATURE[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/;

file = file.replace(regex, '');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
