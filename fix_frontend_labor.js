const fs = require('fs');

const files = [
  'src/app/(dashboard)/part-labor-rules/new/page.tsx',
  'src/app/(dashboard)/part-labor-rules/[id]/edit/page.tsx'
];

files.forEach(path => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace labor_charges with labor_services
    content = content.replace(/from\('labor_charges'\)/g, "from('labor_services')");
    
    fs.writeFileSync(path, content);
    console.log("Updated", path);
  } else {
    console.log("Not found", path);
  }
});
