const fs = require('fs');

const path = 'src/app/(dashboard)/estimates/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// I need to replace the broken area safely
const regex = /\{!\(estimate\.status \|\| \(estimate\.status !== "JOB STARTED" && estimate\.status !== "APPROVED"\)\) && \(\s*\{\(estimate\.status === 'APPROVED' \|\| estimate\.status === 'JOB STARTED'\) && \(\s*<button onClick=\{handleCreateInvoice\}.*?\n.*?\n.*?\s*\)\}\s*\{estimate\.status === 'COMPLETED' && \(\s*<button onClick=\{handleCreateInvoice\}.*?\n.*?\n.*?\s*\)\}\n\s*\n\s*<Link href=\{\`\/estimates\/\$\{estimate\.id\}\/edit\`\}/s;

// Since regex is tricky here, let's just do a targeted slice/replace or read the file and replace lines.
const lines = content.split('\n');
const fixedLines = [];
let inBrokenBlock = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{(!estimate.status || (estimate.status !== "JOB STARTED" && estimate.status !== "APPROVED")) && (')) {
    fixedLines.push(lines[i]);
    fixedLines.push('              <Link href={`/estimates/${estimate.id}/edit`} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm transition"><Edit size={16} /> Edit</Link>');
    fixedLines.push('            )}');
    fixedLines.push('            {(estimate.status === "APPROVED" || estimate.status === "JOB STARTED") && (');
    fixedLines.push('              <button onClick={handleCreateInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm"><CheckCircle size={16} /> Complete Job / Create Invoice</button>');
    fixedLines.push('            )}');
    fixedLines.push('            {estimate.status === "COMPLETED" && (');
    fixedLines.push('              <button onClick={handleCreateInvoice} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">View Invoice</button>');
    fixedLines.push('            )}');
    
    // Skip next few lines until we see className="bg-white border
    let j = i + 1;
    while (j < lines.length && !lines[j].includes('className="bg-white border border-slate-300')) {
      j++;
    }
    i = j; // skip the broken stuff
  } else {
    fixedLines.push(lines[i]);
  }
}

fs.writeFileSync(path, fixedLines.join('\n'));
