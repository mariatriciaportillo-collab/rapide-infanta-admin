const fs = require('fs');
let path = 'src/components/SidebarNav.tsx';
let content = fs.readFileSync(path, 'utf8');

const navItem = `<Link 
              href="/part-labor-rules" 
              className={\`px-3 py-2 rounded-md transition font-medium text-sm flex items-center gap-2
                \${pathname?.startsWith('/part-labor-rules') ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}\`}
            >
              <Cpu size={16} />
              Part-to-Labor Rules
            </Link>`;

content = content.replace(
  /<Link \n\s*href="\/labor-lookup"/,
  `${navItem}\n            <Link \n              href="/labor-lookup"`
);

// Add Cpu import
if (!content.includes('Cpu')) {
  content = content.replace(/import \{ (.*?) \} from 'lucide-react'/, `import { $1, Cpu } from 'lucide-react'`);
}

fs.writeFileSync(path, content);
