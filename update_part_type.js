const fs = require('fs');
let path = 'src/components/parts/PartSearchSelector.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /selling_price\?: number \| null/,
  `selling_price?: number | null\n  auto_suggest_labor?: boolean | null`
);

fs.writeFileSync(path, content);
