const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/supabase\.from\('parts_materials'\)\.select\('id, name, item_code, brand'\)/g, "supabase.from('parts').select('id, name, part_number, brands(name)')");
  fs.writeFileSync(file, content);
}

fix('src/app/(dashboard)/parts-lookup/new/page.tsx');
fix('src/app/(dashboard)/parts-lookup/[id]/edit/page.tsx');

let formFile = fs.readFileSync('src/components/parts/PartsLookupForm.tsx', 'utf8');
formFile = formFile.replace(/p\.item_code/g, 'p.part_number');
formFile = formFile.replace(/p\.brand/g, '(p.brands ? p.brands.name : null)');
fs.writeFileSync('src/components/parts/PartsLookupForm.tsx', formFile);
