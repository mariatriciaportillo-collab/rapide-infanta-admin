const fs = require('fs');

function compactView(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/className="pb-24 max-w-5xl mx-auto"/, 'className="pb-12 max-w-5xl mx-auto"');
  content = content.replace(/mb-6/g, 'mb-4');
  content = content.replace(/p-8/g, 'p-6');
  content = content.replace(/mt-8/g, 'mt-6');
  content = content.replace(/gap-8/g, 'gap-6');
  content = content.replace(/mb-8/g, 'mb-6');
  fs.writeFileSync(filePath, content);
}

compactView('src/app/(dashboard)/quotations/[id]/page.tsx');
compactView('src/app/(dashboard)/estimates/[id]/page.tsx');
