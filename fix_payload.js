const fs = require('fs');

const updatePayload = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  // Find customer_type: customerType, and change it to customer_type: customerType.toUpperCase(),
  content = content.replace(/customer_type: customerType,/g, "customer_type: customerType.toUpperCase(),");
  fs.writeFileSync(filePath, content);
  console.log(`Updated payload in ${filePath}`);
};

updatePayload('src/app/(dashboard)/customers/new/page.tsx');
updatePayload('src/app/(dashboard)/customers/[id]/edit/page.tsx');

