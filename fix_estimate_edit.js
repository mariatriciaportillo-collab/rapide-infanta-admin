const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{\(!estimate\.status \|\| \(estimate\.status !== "JOB STARTED" && estimate\.status !== "APPROVED"\)\) && \(/g,
  "{(!estimate.status || (estimate.status !== 'JOB STARTED' && estimate.status !== 'APPROVED' && estimate.status !== 'COMPLETED')) && ("
);

fs.writeFileSync(path, content);
