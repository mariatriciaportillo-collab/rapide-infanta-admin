const fs = require('fs');

function fixCancel(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix inline cancel buttons
  content = content.replace(/setIsAddingCustomer\(false\); setIsEditingCustomer\(false\);/g, 
    "setIsAddingCustomer(false); setIsEditingCustomer(false); setCreatedNewCustomerId(null);");

  // Fix handleCancel block if any
  content = content.replace(/setIsAddingCustomer\(false\)\n\s*setIsEditingCustomer\(false\)/g, 
    "setIsAddingCustomer(false)\n    setIsEditingCustomer(false)\n    setCreatedNewCustomerId(null)");

  fs.writeFileSync(file, content);
  console.log(`Fixed cancel logic in ${file}`);
}

fixCancel('src/components/quotations/QuotationForm.tsx');
fixCancel('src/components/estimates/EstimateForm.tsx');
