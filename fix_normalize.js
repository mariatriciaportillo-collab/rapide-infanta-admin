const fs = require('fs');
const path = 'src/utils/normalize.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /excludeFields\.includes\(lowerKey\) \|\|/,
  "excludeFields.includes(lowerKey) || \n          lowerKey.includes('type') || \n          lowerKey === 'customer_type' ||"
);

fs.writeFileSync(path, content);
console.log('Fixed normalize.ts');
