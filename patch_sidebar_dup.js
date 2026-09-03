const fs = require('fs');
let file = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

const regex = /<Link\s*href="\/estimate"\s*className=\{`[^`]*`\}\s*>\s*<Settings size=\{16\} \/>\s*Estimate\s*<\/Link>/m;
file = file.replace(regex, '');

fs.writeFileSync('src/components/SidebarNav.tsx', file);
