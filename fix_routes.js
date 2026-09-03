const fs = require('fs');

const filesToUpdate = [
  'src/components/estimates/EstimateForm.tsx',
  'src/components/quotations/ApproveQuotationButton.tsx',
  'src/app/(dashboard)/estimates/page.tsx',
  'src/app/(dashboard)/estimates/new/page.tsx',
  'src/app/(dashboard)/estimates/[id]/page.tsx',
  'src/app/(dashboard)/estimates/[id]/edit/page.tsx',
  'src/app/(dashboard)/estimates/[id]/print/page.tsx',
  'src/components/SidebarNav.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // careful replacement
    content = content.replace(/\/estimate\//g, '/estimates/');
    content = content.replace(/"\/estimate"/g, '"/estimates"');
    content = content.replace(/'\/estimate'/g, "'/estimates'");
    fs.writeFileSync(file, content);
  } else {
    console.log("Missing file: " + file);
  }
});
