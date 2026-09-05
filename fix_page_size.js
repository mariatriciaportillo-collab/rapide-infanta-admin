const fs = require('fs');

const files = [
  'src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx',
  'src/app/(dashboard)/parts/page.tsx',
  'src/app/(dashboard)/packages/page.tsx',
  'src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/const PAGE_SIZE = 25/g, 'const PAGE_SIZE = 10');
    fs.writeFileSync(file, c);
  }
});
console.log('Fixed PAGE_SIZE');
