const fs = require('fs');
let path = 'src/app/(dashboard)/parts/[id]/edit/EditPartClient.tsx';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /is_active: isActive,/,
  `is_active: isActive,\n      auto_suggest_labor: autoSuggestLabor,`
);

content = content.replace(
  /setIsActive\(data\.is_active !== false\)/,
  `setIsActive(data.is_active !== false)\n    setAutoSuggestLabor(data.auto_suggest_labor === true)`
);

content = content.replace(
  /const \[isActive, setIsActive\] = useState\(true\)/,
  `const [isActive, setIsActive] = useState(true)\n  const [autoSuggestLabor, setAutoSuggestLabor] = useState(false)`
);

fs.writeFileSync(path, content);
