const fs = require('fs');
let file = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

const regex = /(<Link[^>]*href="\/estimates"[\s\S]*?<\/Link>)\s*(<Link[^>]*href="\/quotations"[\s\S]*?<\/Link>)/m;
file = file.replace(regex, '$2\n            $1');

fs.writeFileSync('src/components/SidebarNav.tsx', file);
