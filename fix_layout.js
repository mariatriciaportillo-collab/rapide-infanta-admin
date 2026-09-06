const fs = require('fs');

function fixLayout(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Center form and match Rapidé standard width (max-w-3xl)
  content = content.replace(/className="pb-24 max-w-4xl"/g, 'className="pb-24 max-w-3xl mx-auto"');

  // Match the selector row gap with the grid gap (gap-6 instead of gap-4)
  content = content.replace(/className="mb-6 flex gap-4"/g, 'className="mb-6 flex gap-6"');

  // Fix Company Name -> Contact Person spacing
  // It had a separate col-span div for the header. Let's adjust its spacing.
  // Original: <div className="col-span-1 md:col-span-2 mb-2"> ... <h4 className="... pb-2">
  // The grid gap-6 applies AFTER this block. So mb-2 makes it too large.
  // Actually, replacing mb-2 with mt-2 or just removing mb-2 makes it better balanced.
  content = content.replace(/className="col-span-1 md:col-span-2 mb-2"/g, 'className="col-span-1 md:col-span-2 pt-2"');

  // Match input heights.
  // Standard input is `py-2 px-3` or `p-2`. Let's ensure uniform input padding (p-2.5 or p-3?)
  // Actually, they are all `p-2`. 
  // Let's check if the height is unbalanced because of borders? No, they use `border border-slate-300 rounded-md p-2`.

  fs.writeFileSync(file, content);
  console.log(`Fixed layout in ${file}`);
}

fixLayout('src/app/(dashboard)/customers/new/page.tsx');
fixLayout('src/app/(dashboard)/customers/[id]/edit/page.tsx');
