const fs = require('fs');

function fixAlign(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className="flex items-baseline gap-3 mb-2"/g, 'className="flex items-end gap-3 mb-2"');
  content = content.replace(/className="flex items-baseline gap-2 mb-1"/g, 'className="flex items-end gap-3 mb-1"');
  content = content.replace(/className="flex items-baseline gap-2 border-r-2 border-slate-300 pr-4"/g, 'className="flex items-end gap-3 border-r-2 border-slate-300 pr-4"');
  
  // also let's bump the h-8 to h-10 and h-10 to h-12 so the wordmark is big enough (since it's just the wordmark now, not the whole block)
  // View page:
  content = content.replace(/className="h-10 w-auto object-contain"/g, 'className="h-10 w-auto object-contain"'); // Keep 10
  // Print / Form:
  content = content.replace(/className="h-8 w-auto object-contain"/g, 'className="h-8 w-auto object-contain"'); // Keep 8
  
  fs.writeFileSync(file, content);
}

fixAlign('src/app/(dashboard)/quotations/[id]/page.tsx');
fixAlign('src/app/(dashboard)/quotations/[id]/print/page.tsx');
fixAlign('src/components/quotations/QuotationForm.tsx');
