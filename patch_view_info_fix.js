const fs = require('fs');

function fix(filePath, isEstimate) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\{isEstimate \? 'Estimate For' : 'Quoted To'\}/, isEstimate ? 'Estimate For' : 'Quoted To');
  fs.writeFileSync(filePath, content);
}

fix('src/app/(dashboard)/quotations/[id]/page.tsx', false);
fix('src/app/(dashboard)/estimates/[id]/page.tsx', true);
