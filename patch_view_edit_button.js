const fs = require('fs');

function addEditButton(filePath, isEstimate) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const h2Regex = /<h2 className="text-3xl font-bold text-slate-800">([\s\S]*?)<\/h2>/;
  
  const replacement = `
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-800">$1</h2>
            {(!${isEstimate ? 'estimate.status || (estimate.status !== "JOB STARTED" && estimate.status !== "APPROVED")' : 'quote.status || quote.status !== "APPROVED"'}) && (
              <Link href={\`${isEstimate ? '/estimates/${estimate.id}' : '/quotations/${quote.id}'}/edit\`} className="text-slate-400 hover:text-blue-600 transition" title="Edit">
                <Edit size={20} />
              </Link>
            )}
          </div>`;
          
  content = content.replace(h2Regex, replacement);
  fs.writeFileSync(filePath, content);
}

addEditButton('src/app/(dashboard)/quotations/[id]/page.tsx', false);
addEditButton('src/app/(dashboard)/estimates/[id]/page.tsx', true);
