const fs = require('fs');

const files = [
  'src/app/(dashboard)/parts/page.tsx',
  'src/app/(dashboard)/labor-lookup/LaborLookupClient.tsx',
  'src/app/(dashboard)/labor-charges/page.tsx',
  'src/app/(dashboard)/packages/page.tsx',
  'src/app/(dashboard)/parts-lookup/PartsLookupClient.tsx',
  'src/app/(dashboard)/part-labor-rules/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Fix header uppercase, bold
  c = c.replace(/<tr className="[^"]*(bg-slate-50|bg-slate-100|text-xs|uppercase|font-bold|border-b)[^"]*">/g, '<tr>');
  
  // Clean duplicates
  c = c.replace(/py-3 py-3/g, 'py-3');
  c = c.replace(/className="hover:bg-slate-50">>/g, 'className="hover:bg-slate-50">');
  
  // Make sure table container matches Operations exactly:
  // Operations uses: className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"
  c = c.replace(/className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"/g, 'className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6 flex flex-col"');
  
  // Make sure table tags are exact
  c = c.replace(/<table className="w-full text-left border-collapse">/g, '<table className="w-full text-left text-sm whitespace-nowrap">');

  fs.writeFileSync(file, c);
});
console.log('Cleaned up Products & Services tables');
