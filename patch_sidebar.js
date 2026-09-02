const fs = require('fs');
let file = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

const partsLookupLink = `
            <Link 
              href="/parts-lookup" 
              className={\`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                \${pathname?.startsWith('/parts-lookup') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
            >
              <Search size={16} />
              Parts Lookup
            </Link>`;

file = file.replace(/Labor Lookup\n            <\/Link>/, 'Labor Lookup\n            </Link>' + partsLookupLink);

fs.writeFileSync('src/components/SidebarNav.tsx', file);
