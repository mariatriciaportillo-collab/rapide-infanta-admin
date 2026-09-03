const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject the variable definition
content = content.replace(
  /const items = estimate\.estimate_items\.sort\(\(a: any, b: any\) => a\.sort_order - b\.sort_order\)/,
  "const items = estimate.estimate_items.sort((a: any, b: any) => a.sort_order - b.sort_order)\n  const normalizedStatus = (estimate.status || 'DRAFT').toUpperCase()"
);

fs.writeFileSync(path, content);
