const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/part-labor-rules/page.tsx', 'utf8');

// Revert .range() and exact count
c = c.replace(/, \{ count: 'exact' \}\)/, ')');
c = c.replace(/const \{ data, count \}/, 'const { data }');
c = c.replace(/\.range\(\(page - 1\) \* PAGE_SIZE, page \* PAGE_SIZE - 1\)/, '');
c = c.replace(/if \(count !== null\) setTotalCount\(count\)/, '');
c = c.replace(/useEffect\(\(\) => \{\n    loadRules\(\)\n  \}, \[page\]\)/, 'useEffect(() => {\n    loadRules()\n  }, [])');

// Add search reset to page 1
c = c.replace(/onChange=\{e => setSearch\(e.target.value\)\}/, 'onChange={e => { setSearch(e.target.value); setPage(1); }}');

// Use client slicing
c = c.replace(/filteredRules\.map\(rule =>/g, "filteredRules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(rule =>");
c = c.replace(/<Pagination totalCount=\{totalCount\}/, '<Pagination totalCount={filteredRules.length}');

fs.writeFileSync('src/app/(dashboard)/part-labor-rules/page.tsx', c);
console.log('Fixed client pagination in PLR');
