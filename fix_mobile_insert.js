const fs = require('fs');
const path = 'src/components/quick-sale/QuickSaleForm.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /telephone: customerTelephone,/,
  "mobile: mobile,\n      telephone: customerTelephone,"
);

fs.writeFileSync(path, content);
