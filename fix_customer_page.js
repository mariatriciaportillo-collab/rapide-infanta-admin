const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/customers/[id]/page.tsx', 'utf8');

if (!c.includes('import { CustomerServiceHistory }')) {
  // Add import
  c = c.replace(/import Link from 'next\/link'/g, "import Link from 'next/link'\nimport { CustomerServiceHistory } from '@/components/customers/CustomerServiceHistory'");
  
  // Add query
  const queryStr = `  // 3. Fetch Quotation History
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  // 4. Fetch Service History (Invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, vehicles(plate_number, make, model), invoice_items(description, item_name, name)')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })`;

  c = c.replace(/  \/\/ 3\. Fetch Quotation History[\s\S]*?\.order\('created_at', \{ ascending: false \}\)/, queryStr);
  
  // Add Component injection
  const injection = `          </div>

          {/* Service History */}
          <CustomerServiceHistory invoices={invoices || []} vehicles={vehicles || []} />

          {/* Quotation History */}`;

  c = c.replace(/          <\/div>\n\n          \{\/\* Quotation History \*\/\}/g, injection);
  
  fs.writeFileSync('src/app/(dashboard)/customers/[id]/page.tsx', c);
  console.log('Customer Details Page Updated');
} else {
  console.log('Already updated');
}
