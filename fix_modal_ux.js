const fs = require('fs');

function fixModal(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add state for createdNewCustomerId if not exists
  if (!content.includes('createdNewCustomerId')) {
    content = content.replace(/const \[isAddingCustomer, setIsAddingCustomer\] = useState\(false\)/, 
      "const [isAddingCustomer, setIsAddingCustomer] = useState(false)\n  const [createdNewCustomerId, setCreatedNewCustomerId] = useState<string | null>(null)");
  }

  // Update handleCreateCustomer
  const saveLogicRegex = /const \{ data: newCust, error: custErr \} = await saveCustomerRecord\(supabase, \{[\s\S]*?tin: customerTin\n\s*\}\)[\s\S]*?if \(custErr\) \{\n\s*setError\(`Failed to create customer: \$\{custErr\.message\}`\)\n\s*return\n\s*\}/;

  const newSaveLogic = `
    let customerRecord = null;
    
    if (createdNewCustomerId) {
      // Re-use already created customer to prevent duplicates if vehicle failed previously
      const { data } = await supabase.from('customers').select('*').eq('id', createdNewCustomerId).single();
      customerRecord = data;
    } else {
      const { data: newCust, error: custErr } = await saveCustomerRecord(supabase, {
        customerType,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        companyName: cleanCompanyName,
        contactFirstName,
        contactLastName,
        mobile: customerMobile,
        telephone: customerTelephone,
        email: customerEmail,
        address: customerAddress,
        tin: customerTin
      })
      
      if (custErr) {
        setError(\`Failed to create customer: \${custErr.message}\`)
        return
      }
      customerRecord = newCust;
      setCreatedNewCustomerId(newCust.id); // Save ID to prevent duplication on retry
    }
  `;
  
  content = content.replace(saveLogicRegex, newSaveLogic);
  
  // Update vehicle creation logic
  const vPayloadRegex = /const vPayload = \{\n\s*customer_id: newCust\.id,/;
  content = content.replace(vPayloadRegex, "const vPayload = {\n        customer_id: customerRecord.id,");
  
  const vErrRegex = /if \(vErr\) \{\n\s*\/\/ Still proceed, just log error for vehicle\n\s*console\.error\("Failed to create vehicle:", vErr\)\n\s*\} else \{\n\s*newVeh = vData;\n\s*\}/;
  const newVErr = `if (vErr) {
        setError(\`Customer created, but failed to create vehicle: \${vErr.message}. Please try saving the vehicle again.\`)
        return // Halt and keep modal open so user can fix vehicle and retry
      } else {
        newVeh = vData;
      }`;
  content = content.replace(vErrRegex, newVErr);

  // Update selection
  content = content.replace(/await handleSelectCustomer\(newCust\)/, "await handleSelectCustomer(customerRecord)\n    setCreatedNewCustomerId(null) // Reset on full success");

  // Also clear createdNewCustomerId when closing modal manually
  content = content.replace(/setIsAddingCustomer\(false\)\n\s*\}\n\s*return \(\n\s*<div/, 
    "setIsAddingCustomer(false)\n    setCreatedNewCustomerId(null)\n  }\n\n  return (\n    <div");

  fs.writeFileSync(file, content);
  console.log(`Fixed modal UX in ${file}`);
}

fixModal('src/components/quotations/QuotationForm.tsx');
fixModal('src/components/estimates/EstimateForm.tsx');
