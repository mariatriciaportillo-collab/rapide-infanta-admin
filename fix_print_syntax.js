const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

// The extra </div> is immediately before {/* Items Table */}
// Let's replace "</div>\n      </div>\n\n      {/* Items Table */}"
// with "</div>\n\n      {/* Items Table */}"

file = file.replace(/<\/div>\s*<\/div>\s*{\/\* Items Table \*\//g, '</div>\n\n      {/* Items Table */}');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
