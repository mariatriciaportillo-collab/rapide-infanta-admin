const fs = require('fs');
const path = 'src/components/estimates/EstimateActionBar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const isDraft = !initialStatus \|\| initialStatus === 'DRAFT'\n  const isStarted = initialStatus === 'JOB STARTED' \|\| initialStatus === 'APPROVED'\n  const isCompleted = initialStatus === 'COMPLETED'/,
  "const normStatus = (initialStatus || 'DRAFT').toUpperCase()\n  const isDraft = normStatus === 'DRAFT'\n  const isStarted = normStatus === 'JOB STARTED' || normStatus === 'APPROVED'\n  const isCompleted = normStatus === 'COMPLETED'"
);

content = content.replace(
  /if \(initialStatus !== 'COMPLETED'/g,
  "if (normStatus !== 'COMPLETED'"
);

fs.writeFileSync(path, content);
