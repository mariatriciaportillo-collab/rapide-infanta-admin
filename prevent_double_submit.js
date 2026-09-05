const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add if (isSubmitting) return
  content = content.replace(/const handleSave = async \(e: React\.FormEvent\) => \{\n\s*e\.preventDefault\(\)/, 
    "const handleSave = async (e: React.FormEvent) => {\n    e.preventDefault()\n    if (isSubmitting) return");

  fs.writeFileSync(file, content);
  console.log(`Updated double submit in ${file}`);
}

updateFile('src/app/(dashboard)/customers/new/page.tsx');
updateFile('src/app/(dashboard)/customers/[id]/edit/page.tsx');
