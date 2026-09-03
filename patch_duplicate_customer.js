const fs = require('fs');

function patchCustomerSave(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if not present
  if (!content.includes('checkDuplicateCustomer')) {
    content = content.replace(
      /import \{ createClient \} from '@\/utils\/supabase\/client'/, 
      "import { createClient } from '@/utils/supabase/client'\nimport { checkDuplicateCustomer } from '@/utils/checkDuplicateCustomer'"
    );
  }

  // Update handleCreateNewCustomer
  const targetRegex = /const normalizedPlate = vehiclePlate\.replace\(\/\[\^A-Z0-9\]\/ig, ''\)\.toUpperCase\(\)/;
  
  const replacement = `
    const duplicate = await checkDuplicateCustomer(supabase, customerType, cleanFirstName, cleanLastName, cleanCompanyName)
    if (duplicate) {
      setError("Customer already exists. Please select the existing customer instead.")
      return
    }
    
    const normalizedPlate = vehiclePlate.replace(/[^A-Z0-9]/ig, '').toUpperCase()`;
  
  // We only replace if we haven't already
  if (!content.includes('checkDuplicateCustomer(supabase')) {
    content = content.replace(targetRegex, replacement);
  }

  fs.writeFileSync(filePath, content);
}

patchCustomerSave('src/components/quotations/QuotationForm.tsx');
patchCustomerSave('src/components/estimates/EstimateForm.tsx');

// Also try to patch app/(dashboard)/customers/new/page.tsx if it exists
patchCustomerSave('src/app/(dashboard)/customers/new/page.tsx');

