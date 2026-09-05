const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/payments/page.tsx', 'utf8');

// Import Pagination
c = c.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport { Pagination } from '@/components/ui/Pagination'");

// Add pagination states
c = c.replace("const [loading, setLoading] = useState(true)", "const [loading, setLoading] = useState(true)\n  const [dpPage, setDpPage] = useState(1)\n  const [histPage, setHistPage] = useState(1)\n  const [histTotal, setHistTotal] = useState(0)\n  const pageSize = 10");

// Update loadData to handle history range
c = c.replace(/const loadData = async \(\) => {[\s\S]*?setLoading\(false\)\n  \}/, (match) => {
  let inner = match;
  // Replace .limit(50) with .range for history
  inner = inner.replace(/\.limit\(50\)/, ".range((histPage - 1) * pageSize, histPage * pageSize - 1)");
  // Add count: 'exact' to history
  inner = inner.replace(/\.select\([\s\S]*?quotations:quotation_id\(quote_number\)\n\s*\`\)/, `$&, { count: 'exact' }`);
  // Capture count
  inner = inner.replace(/const \{ data: payData \} = await supabase/, "const { data: payData, count: payCount } = await supabase");
  // Set count
  inner = inner.replace(/setHistory\(payData \|\| \[\]\)/, "setHistory(payData || [])\n    if (payCount !== null) setHistTotal(payCount)");
  return inner;
});

// Update useEffect dependency
c = c.replace(/\[supabase\]\)/, "[supabase, histPage])");

// Now we need to handle Downpayments frontend slicing
c = c.replace(/downpayments.length === 0/g, "dpToDisplay.length === 0");
c = c.replace(/downpayments\.map\(\(q\)/g, "dpToDisplay.map((q)");

c = c.replace(/return \(\n\s*<div/, "const dpToDisplay = downpayments.slice((dpPage - 1) * pageSize, dpPage * pageSize)\n\n  return (\n    <div");

// Add <Pagination> to tables
c = c.replace(/(<\/table>\n\s*<\/div>\n\s*<\/div>)([\s\S]*?)(\{tab === 'history')/, "$1\n        {tab === 'downpayment' && <Pagination totalCount={downpayments.length} pageSize={pageSize} currentPage={dpPage} onPageChange={setDpPage} />}\n$2$3");

c = c.replace(/(<\/table>\n\s*<\/div>\n\s*<\/div>)([\s\S]*?)(<\/div>\n\s*<\/div>\n\s*\{showModal)/, "$1\n        {tab === 'history' && <Pagination totalCount={histTotal} pageSize={pageSize} currentPage={histPage} onPageChange={setHistPage} />}\n$2$3");

fs.writeFileSync('src/app/(dashboard)/payments/page.tsx', c);
console.log('Fixed payments pagination');
