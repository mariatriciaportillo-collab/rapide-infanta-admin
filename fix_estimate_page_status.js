const fs = require('fs');
const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find where estimate is fetched
content = content.replace(
  /const estimate = estimateData\n/,
  "const estimate = estimateData\n  const normalizedStatus = (estimate.status || 'DRAFT').toUpperCase()\n"
);

// Replace status checks
content = content.replace(
  /\{\(!estimate\.status \|\| \(estimate\.status !== 'JOB STARTED' && estimate\.status !== 'APPROVED' && estimate\.status !== 'COMPLETED'\)\) && \(/g,
  "{(normalizedStatus !== 'JOB STARTED' && normalizedStatus !== 'APPROVED' && normalizedStatus !== 'COMPLETED') && ("
);

content = content.replace(
  /\$\{estimate\.status === 'APPROVED' \? 'bg-green-100 text-green-700' : \n              estimate\.status === 'REJECTED' \? 'bg-red-100 text-red-700' : /g,
  "${normalizedStatus === 'APPROVED' || normalizedStatus === 'JOB STARTED' ? 'bg-green-100 text-green-700' : \n              normalizedStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : \n              normalizedStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : "
);

content = content.replace(
  />\n            \{estimate\.status\}\n          <\/span>/g,
  ">\n            {normalizedStatus}\n          </span>"
);

content = content.replace(
  /<EstimateActionBar estimateId=\{estimate\.id\} initialStatus=\{estimate\.status \|\| ''\} \/>/g,
  "<EstimateActionBar estimateId={estimate.id} initialStatus={normalizedStatus} />"
);

fs.writeFileSync(path, content);
