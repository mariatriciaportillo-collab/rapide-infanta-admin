const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /if \(estimate\.status !== 'JOB STARTED' && estimate\.status !== 'APPROVED'\) \{/,
  "if (estimate.status !== 'JOB STARTED' && estimate.status !== 'APPROVED' && estimate.status !== 'COMPLETED') {"
);

fs.writeFileSync(path, content);
