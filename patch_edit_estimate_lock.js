const fs = require('fs');

const filePath = 'src/app/(dashboard)/estimates/[id]/edit/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The file might already have a lock mechanism, let's see.
if (!content.includes('Estimate Locked')) {
  const replacement = `  if (error || !estimate) {
    notFound()
  }
  
  const status = (estimate.status || '').toUpperCase()
  if (status === 'JOB STARTED' || status === 'APPROVED') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Estimate Locked</h2>
        <p>This estimate has been approved and the job has started. It can no longer be edited.</p>
        <a href={\`/estimates/\${id}\`} className="mt-4 bg-slate-800 text-white px-6 py-2 rounded-md hover:bg-slate-700 font-medium">
          Back to Estimate
        </a>
      </div>
    )
  }`;

  content = content.replace(/  if \(error \|\| \!estimate\) \{\n    notFound\(\)\n  \}/, replacement);
  fs.writeFileSync(filePath, content);
}
