const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /query = query\.or\(\`name\.ilike\.%\$\{searchTerm\}%,first_name\.ilike\.%\$\{searchTerm\}%,last_name\.ilike\.%\$\{searchTerm\}%,legacy_name\.ilike\.%\$\{searchTerm\}%\`\)/,
  "query = query.or(`name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,contact_first_name.ilike.%${searchTerm}%,contact_last_name.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%`)"
);

fs.writeFileSync(path, content);
