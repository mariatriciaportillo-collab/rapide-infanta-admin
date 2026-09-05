const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/parts/page.tsx', 'utf8');
c = c.replace(/<div className="overflow-x-auto">\n/g, '');
c = c.replace(/<\/table>\n\s*<\/div>/g, '</table>');
fs.writeFileSync('src/app/(dashboard)/parts/page.tsx', c);
