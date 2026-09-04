const fs = require('fs');
let path = 'src/app/(dashboard)/part-labor-rules/new/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace ruleId check for new rule
content = content.replace(
  /if \(er\.id === \(typeof ruleId !== 'undefined' \? ruleId : undefined\)\) continue;/,
  `// In new mode, we don't have a ruleId to skip`
);

fs.writeFileSync(path, content);
