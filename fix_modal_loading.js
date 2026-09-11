const fs = require('fs');

function fixLoading(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add state if not present
  if (!content.includes('isSavingCustomer')) {
    content = content.replace(/const \[isAddingCustomer, setIsAddingCustomer\] = useState\(false\)/, 
      "const [isAddingCustomer, setIsAddingCustomer] = useState(false)\n  const [isSavingCustomer, setIsSavingCustomer] = useState(false)");
  }

  // Inject into handleCreateNewCustomer
  content = content.replace(/const handleCreateNewCustomer = async \(\) => \{\n\s*setError\(null\)/, 
    "const handleCreateNewCustomer = async () => {\n    if (isSavingCustomer) return;\n    setIsSavingCustomer(true);\n    setError(null)");

  // Add finally block or resetting state
  // Rather than parsing everything, we can just replace all 'return' statements inside the method with 'setIsSavingCustomer(false); return;' but that's messy.
  // Wait, I can inject a try...finally block.
  // Actually, replacing all `return` inside `handleCreateNewCustomer` is too complex with regex.
  // Let's just find `setIsAddingCustomer(false)` and `setError(...) \n return` inside the block.
  
  content = content.replace(/setError\("First Name and Last Name are required."\)\n\s*return/g, 'setError("First Name and Last Name are required."); setIsSavingCustomer(false); return');
  content = content.replace(/setError\("Company Name is required."\)\n\s*return/g, 'setError("Company Name is required."); setIsSavingCustomer(false); return');
  content = content.replace(/setError\("Plate Number is required."\); return;/g, 'setError("Plate Number is required."); setIsSavingCustomer(false); return;');
  content = content.replace(/setError\("Make is required."\); return;/g, 'setError("Make is required."); setIsSavingCustomer(false); return;');
  content = content.replace(/setError\("Model is required."\); return;/g, 'setError("Model is required."); setIsSavingCustomer(false); return;');
  content = content.replace(/setError\("Year is required."\); return;/g, 'setError("Year is required."); setIsSavingCustomer(false); return;');
  
  content = content.replace(/if \(custErr\) \{\n\s*setError\(`Failed to create customer: \$\{custErr\.message\}`\)\n\s*return/g, 'if (custErr) {\n        setError(`Failed to create customer: ${custErr.message}`)\n        setIsSavingCustomer(false)\n        return');
  
  content = content.replace(/if \(vErr\) \{\n\s*setError\(`Customer created, but failed to create vehicle: \$\{vErr\.message\}\. Please try saving the vehicle again\.`\)\n\s*return/g, 'if (vErr) {\n        setError(`Customer created, but failed to create vehicle: ${vErr.message}. Please try saving the vehicle again.`)\n        setIsSavingCustomer(false)\n        return');

  content = content.replace(/setIsAddingCustomer\(false\)\n\s*setCreatedNewCustomerId\(null\)\n\s*\}/g, 'setIsAddingCustomer(false)\n    setCreatedNewCustomerId(null)\n    setIsSavingCustomer(false)\n  }');

  // Disable the modal save button
  content = content.replace(/<button type="button" onClick=\{handleCreateNewCustomer\}/g, '<button type="button" disabled={isSavingCustomer} onClick={handleCreateNewCustomer}');
  content = content.replace(/\{isAddingCustomer \? 'Add New Customer' : 'Save Changes'\}/g, '{isSavingCustomer ? "Saving..." : isAddingCustomer ? "Add New Customer" : "Save Changes"}');

  fs.writeFileSync(file, content);
  console.log(`Fixed modal loading in ${file}`);
}

fixLoading('src/components/quotations/QuotationForm.tsx');
fixLoading('src/components/estimates/EstimateForm.tsx');
