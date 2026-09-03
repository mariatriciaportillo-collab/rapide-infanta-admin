const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /grand_total: grandTotal,\n          notes,\n          inventory_deducted: status === 'UNPAID'\n        \}\)/g, 
  "grand_total: grandTotal,\n          balance_due: grandTotal,\n          notes,\n          inventory_deducted: status === 'UNPAID'\n        })"
);

content = content.replace(
  /grand_total: grandTotal,\n          prepared_by: preparedBy,\n          notes,\n          inventory_deducted: status === 'UNPAID'\n        \}\)/g, 
  "grand_total: grandTotal,\n          balance_due: grandTotal,\n          prepared_by: preparedBy,\n          notes,\n          inventory_deducted: status === 'UNPAID'\n        })"
);

fs.writeFileSync(path, content);
