const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}

fix('src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx');
fix('src/components/SidebarNav.tsx');
