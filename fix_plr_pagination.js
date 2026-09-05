const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/part-labor-rules/page.tsx', 'utf8');

if (!c.includes('<Pagination')) {
  // Add import
  c = c.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport { Pagination } from '@/components/ui/Pagination'");

  // Add state
  c = c.replace("const [search, setSearch] = useState('')", "const [search, setSearch] = useState('')\n  const [page, setPage] = useState(1)\n  const [totalCount, setTotalCount] = useState(0)\n  const PAGE_SIZE = 10");

  // Modify loadRules
  c = c.replace(/const \{ data \} = await supabase[\s\S]*?\.order\('created_at', \{ ascending: false \}\)/, (match) => {
    return match.replace('.select(`', '.select(`').replace(/\`\)/, '`, { count: \'exact\' })')
      .replace('const { data }', 'const { data, count }')
      + '\n      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)';
  });
  
  c = c.replace(/if \(data\) setRules\(data\)/, 'if (data) setRules(data)\n    if (count !== null) setTotalCount(count)');

  // Update useEffect dependency
  c = c.replace(/useEffect\(\(\) => \{\n    loadRules\(\)\n  \}, \[\]\)/, 'useEffect(() => {\n    loadRules()\n  }, [page])');

  // Add Pagination component
  c = c.replace(/(<\/table>\n\s*<\/div>)\n\s*<\/div>/, "$1\n        <Pagination totalCount={totalCount} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />\n      </div>");

  fs.writeFileSync('src/app/(dashboard)/part-labor-rules/page.tsx', c);
  console.log('Added pagination to part-labor-rules');
}
