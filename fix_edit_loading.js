const fs = require('fs');

function fixEditLoading(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Inject into handleSaveCustomerChanges
  content = content.replace(/const handleSaveCustomerChanges = async \(\) => \{\n\s*if \(\!selectedCustomerId\) return\n\s*setError\(null\)/, 
    "const handleSaveCustomerChanges = async () => {\n    if (isSavingCustomer) return;\n    setIsSavingCustomer(true);\n    if (!selectedCustomerId) { setIsSavingCustomer(false); return; }\n    setError(null)");

  // At the end of handleSaveCustomerChanges, there's setIsEditingCustomer(false)
  content = content.replace(/setIsEditingCustomer\(false\)\n\s*\}\n\s*const handleCancelCustomer/g, 
    "setIsEditingCustomer(false)\n    setIsSavingCustomer(false)\n  }\n\n  const handleCancelCustomer");
    
  // Disable the update button
  content = content.replace(/<button type="button" onClick=\{handleSaveCustomerChanges\}/g, '<button type="button" disabled={isSavingCustomer} onClick={handleSaveCustomerChanges}');

  fs.writeFileSync(file, content);
  console.log(`Fixed edit modal loading in ${file}`);
}

fixEditLoading('src/components/quotations/QuotationForm.tsx');
fixEditLoading('src/components/estimates/EstimateForm.tsx');
