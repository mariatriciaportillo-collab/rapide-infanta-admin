const fs = require('fs');

const pages = [
  'src/app/(dashboard)/quotations/page.tsx',
  'src/app/(dashboard)/estimates/page.tsx',
  'src/app/(dashboard)/invoice/page.tsx'
];

pages.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  
  // 1. Replace the component signature to accept searchParams
  const isInvoice = file.includes('invoice');
  const typeName = isInvoice ? 'InvoicesPage' : (file.includes('quotations') ? 'QuotationsPage' : 'EstimatesPage');
  
  // Replace: export default async function QuotationsPage() {
  const sigRegex = new RegExp(`export default async function ${typeName}\\(\\)\\s*\\{`);
  
  if (c.match(sigRegex)) {
    c = c.replace(sigRegex, `export default async function ${typeName}({ searchParams }: { searchParams: Promise<{ page?: string }> }) {\n  const params = await searchParams\n  const currentPage = parseInt(params.page || '1', 10)\n  const pageSize = 10\n  const from = (currentPage - 1) * pageSize\n  const to = from + pageSize - 1\n`);
  }
  
  // 2. Add count: 'exact' and range to the query
  // const { data: quotations, error } = await supabase.from('quotations').select('*').order('created_at', { ascending: false })
  const table = isInvoice ? 'invoices' : (file.includes('quotations') ? 'quotations' : 'estimates');
  const dataVar = isInvoice ? 'invoices' : (file.includes('quotations') ? 'quotations' : 'estimates');
  
  const queryRegex = new RegExp(`const \\{ data: (\\w+), error \\} = await supabase\\s*\\.from\\('${table}'\\)\\s*\\.select\\('\\*'\\)\\s*\\.order\\('created_at', \\{ ascending: false \\}\\)`);
  c = c.replace(queryRegex, `const { data: $1, count, error } = await supabase
    .from('${table}')
    .select('*, customers(name, first_name, last_name, customer_type), vehicles(make, model, plate_number)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)`);
    
  // Also fix the case where select('*, ...') was already there (not just '*')
  // Wait, I should just regex the `.order` and append `.range` and add `count`!
  // Let's use a smarter replace if the above failed
  if (!c.includes('.range(from, to)')) {
    // It didn't match.
    // Let's find `.order('created_at', { ascending: false })`
    // and replace with `.order('created_at', { ascending: false }).range(from, to)`
    c = c.replace(/\.order\('created_at', \{ ascending: false \}\)/, `.order('created_at', { ascending: false }).range(from, to)`);
    
    // Replace `const { data: x, error }` with `const { data: x, count, error }`
    c = c.replace(/const \{ data: (\\w+), error \}/, 'const { data: $1, count, error }');
    
    // Replace `.select(`...`)` with `.select(`...`, { count: 'exact' })`
    // Actually, I can just match `.select(` and append `{ count: 'exact' }`.
    // We will do that manually to be safe.
  }
  
  // 3. Import UrlPagination
  if (!c.includes('UrlPagination')) {
    c = c.replace("import Link from 'next/link'", "import Link from 'next/link'\nimport { UrlPagination } from '@/components/ui/UrlPagination'");
  }
  
  // 4. Add the component at the end of the table container
  // Find </table>\n      </div>
  c = c.replace(/<\/table>\n\s*<\/div>/, `</table>\n      </div>\n      <UrlPagination totalCount={count || 0} pageSize={pageSize} currentPage={currentPage} />`);
  
  fs.writeFileSync(file, c);
  console.log(`Updated server pagination in ${file}`);
});
