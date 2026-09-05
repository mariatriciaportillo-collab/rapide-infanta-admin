const fs = require('fs');
const files = [
  'src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx',
  'src/app/(dashboard)/labor-charges/LaborChargesClient.tsx',
  'src/app/(dashboard)/packages/page.tsx',
  'src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx',
  'src/app/(dashboard)/part-labor-rules/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/<table className="w-full text-left text-sm whitespace-nowrap">/g, '<table className="w-full text-left text-sm">');
    fs.writeFileSync(file, c);
  }
});
console.log('Removed global whitespace-nowrap');
