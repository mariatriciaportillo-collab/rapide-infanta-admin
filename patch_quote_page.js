const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', 'utf8');

file = file.replace(/import \{ format \} from 'date-fns'/, "import { format } from 'date-fns'\nimport { ApproveQuotationButton } from '@/components/quotations/ApproveQuotationButton'");

// We need to fetch the existing estimate if it exists
file = file.replace(/const isCompany = quote\.customer_type === 'company'/, `const isCompany = quote.customer_type === 'company'
  const { data: est } = await supabase.from('estimates').select('id').eq('quotation_id', quote.id).maybeSingle()`);

const btnRegex = /<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2 shadow-sm">\s*<CheckCircle2 size=\{18\} \/>\s*Mark Approved\s*<\/button>/m;
file = file.replace(btnRegex, `<ApproveQuotationButton quotationId={quote.id} initialStatus={quote.status} initialEstimateId={est?.id} />`);

fs.writeFileSync('src/app/(dashboard)/quotations/[id]/page.tsx', file);
