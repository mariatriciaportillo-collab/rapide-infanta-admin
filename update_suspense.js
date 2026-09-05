const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/customers/[id]/page.tsx', 'utf8');

c = c.replace(/import \{ CustomerTabs \} from '@\/components\/customers\/CustomerTabs'/g, "import { CustomerTabs } from '@/components/customers/CustomerTabs'\nimport { Suspense } from 'react'");

c = c.replace(/      <CustomerTabs /g, "      <Suspense fallback={<div className=\"p-8 text-center text-slate-500\">Loading details...</div>}>\n        <CustomerTabs ");
c = c.replace(/        quickSales=\{quickSales \|\| \[\]\}\n      \/>/g, "        quickSales={quickSales || []}\n      />\n      </Suspense>");

fs.writeFileSync('src/app/(dashboard)/customers/[id]/page.tsx', c);
