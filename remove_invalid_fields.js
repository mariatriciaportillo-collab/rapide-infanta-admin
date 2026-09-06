const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('company_name:')) {
    content = content.replace(/\n\s*company_name:.*?null,/g, '');
    changed = true;
  }
  
  if (content.includes('contact_person:')) {
    content = content.replace(/\n\s*contact_person:.*?null,/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned up payload in ${file}`);
  }
}

fixFile('src/app/(dashboard)/customers/new/page.tsx');
fixFile('src/app/(dashboard)/customers/[id]/edit/page.tsx');
fixFile('src/components/quick-sale/QuickSaleForm.tsx');
fixFile('src/components/estimates/EstimateForm.tsx');
fixFile('src/components/quotations/QuotationForm.tsx');
