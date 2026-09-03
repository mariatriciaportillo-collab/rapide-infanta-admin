const fs = require('fs');
const path = 'src/components/estimates/EstimateActionBar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /if \(!confirm\('Complete this job\?\\\\n\\\\nThis will mark the Estimate as completed and create the customer\\\\'s Invoice\/Billing Statement\. The Estimate will remain locked\.'\)\) \{/,
  "if (initialStatus !== 'COMPLETED' && !confirm('Complete this job?\\n\\nThis will mark the Estimate as completed and create the customer\\'s Invoice/Billing Statement. The Estimate will remain locked.')) {"
);

fs.writeFileSync(path, content);
