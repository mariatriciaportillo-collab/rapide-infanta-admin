const fs = require('fs');
let file = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

const estimateLink = `
            <Link 
              href="/estimate" 
              className={\`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                \${pathname?.startsWith('/estimate') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
            >
              <FileText size={16} />
              Estimate
            </Link>`;

file = file.replace(/<Link \n\s+href="\/quotations"/, estimateLink + '\n            <Link \n              href="/quotations"');

fs.writeFileSync('src/components/SidebarNav.tsx', file);
