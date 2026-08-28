const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', 'utf8');

// We want to remove the specific extra </div> before {/* Items Table */}
// It looks like:
//   </div>
//   </div>
//
//   {/* Items Table */}

file = file.replace(/<\/div>\n\s*<\/div>\n\n\s*{\/\* Items Table \*\/}/, '</div>\n\n      {/* Items Table */}');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/print/page.tsx', file);
