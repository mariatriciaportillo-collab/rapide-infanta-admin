const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace DRAFT / COMPLETED with DRAFT / UNPAID
content = content.replace(/status: 'DRAFT' \| 'COMPLETED'/g, "status: 'DRAFT' | 'UNPAID'");
content = content.replace(/status === 'COMPLETED'/g, "status === 'UNPAID'");
content = content.replace(/initialData\?\.status === 'COMPLETED'/g, "initialData?.status === 'UNPAID'");

// Add inventory_deducted: true to insert/update when UNPAID
content = content.replace(
  /grand_total: grandTotal,\n\s*prepared_by: preparedBy,\n\s*notes\n\s*\}\)/g, 
  "grand_total: grandTotal,\n          prepared_by: preparedBy,\n          notes,\n          inventory_deducted: status === 'UNPAID'\n        })"
);

content = content.replace(
  /grand_total: grandTotal,\n\s*notes\n\s*\}\)/g, 
  "grand_total: grandTotal,\n          notes,\n          inventory_deducted: status === 'UNPAID'\n        })"
);

fs.writeFileSync(path, content);
