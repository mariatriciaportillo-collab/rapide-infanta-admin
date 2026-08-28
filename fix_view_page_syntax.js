const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

// The bad injected block starts at `{/* Legal & Signatures */}` and ends with `  )\n}`
const badBlockStart = file.indexOf('{/* Legal & Signatures */}');
if (badBlockStart !== -1) {
  const fileBefore = file.substring(0, badBlockStart);
  
  // Find the `  )\n}` that was injected
  const badBlockEnd = file.indexOf('  )\n}\n', badBlockStart);
  
  if (badBlockEnd !== -1) {
    const fileAfter = file.substring(badBlockEnd + 5);
    // Restore the `</div></div>)}` that was overwritten
    file = fileBefore + '                    </div>\n                  </div>\n                )}\n' + fileAfter;
  }
}

// Then let's add the Logo Replacement
file = file.replace(/<h1 className="text-4xl font-black text-blue-900 tracking-tighter mb-1">RAPIDÉ<\/h1>\s*<p className="text-sm font-medium text-slate-500 tracking-widest uppercase">Auto Service Experts<\/p>/, '<img src="/rapide-logo.png" alt="Rapidé Auto Service Experts" className="h-14 w-auto object-contain mb-2" />');

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
