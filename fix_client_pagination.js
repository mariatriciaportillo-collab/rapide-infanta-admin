const fs = require('fs');

const fixClientPagination = (file) => {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('import { Pagination }')) return;
  
  // 1. Add Pagination import
  c = c.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport { Pagination } from '@/components/ui/Pagination'");

  // 2. Add state
  c = c.replace(/const \[loading, setLoading\] = useState\(true\)/, "const [loading, setLoading] = useState(true)\n  const [currentPage, setCurrentPage] = useState(1)\n  const [totalCount, setTotalCount] = useState(0)\n  const pageSize = 10");

  // 3. Update query in load()
  // This is tricky because it depends on the file. Let's do it manually per file.
  fs.writeFileSync(file, c);
}

// Just add imports and state
['src/app/(dashboard)/invoice/page.tsx', 'src/app/(dashboard)/quick-sale/page.tsx'].forEach(fixClientPagination);

// Quick Sale search reset to page 1
let qs = fs.readFileSync('src/app/(dashboard)/quick-sale/page.tsx', 'utf8');
qs = qs.replace(/onChange=\{e => setSearchQuery\(e\.target\.value\)\}/, "onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}");
qs = qs.replace(/onChange=\{e => setStatusFilter\(e\.target\.value\)\}/, "onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}");

// Quick Sale query pagination
qs = qs.replace(/let query = supabase\s*\.from\('quick_sales'\)\s*\.select\([\s\S]*?\)\s*\.order\('created_at', \{ ascending: false \}\)/, (match) => {
  return match.replace('.select(`', '.select(`').replace(/`\)/, '`, { count: \'exact\' })');
});
qs = qs.replace(/const \{ data \} = await query/, "const { data, count } = await query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1)\n      if (count !== null) setTotalCount(count)");
qs = qs.replace(/\[supabase, searchQuery, statusFilter\]/, "[supabase, searchQuery, statusFilter, currentPage]");
qs = qs.replace(/<\/table>\n\s*<\/div>\n\s*<\/div>/, "</table>\n        </div>\n        <Pagination totalCount={totalCount} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />\n      </div>");
fs.writeFileSync('src/app/(dashboard)/quick-sale/page.tsx', qs);

// Invoice query pagination
let inv = fs.readFileSync('src/app/(dashboard)/invoice/page.tsx', 'utf8');
inv = inv.replace(/const \{ data \} = await supabase\s*\.from\('invoices'\)\s*\.select\([\s\S]*?\)\s*\.order\('created_at', \{ ascending: false \}\)/, (match) => {
  return match.replace('.select(`', '.select(`').replace(/`\)/, '`, { count: \'exact\' })').replace(/const \{ data \}/, 'const { data, count }') + "\n        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)";
});
inv = inv.replace(/if \(data\) setInvoices\(data\)/, "if (data) setInvoices(data)\n      if (count !== null) setTotalCount(count)");
inv = inv.replace(/\[supabase\]\)/, "[supabase, currentPage])");
inv = inv.replace(/<\/table>\n\s*<\/div>\n\s*<\/div>/, "</table>\n        </div>\n        <Pagination totalCount={totalCount} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />\n      </div>");
fs.writeFileSync('src/app/(dashboard)/invoice/page.tsx', inv);

console.log('Fixed Quick Sale and Invoice pagination');
