const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/vehicles/[id]/page.tsx', 'utf8');

if (!c.includes('import { CustomerServiceHistory }')) {
  // Add import
  c = c.replace(/import Link from 'next\/link'/g, "import Link from 'next/link'\nimport { CustomerServiceHistory } from '@/components/customers/CustomerServiceHistory'");
  
  // Add query
  const queryStr = `  // 2. Fetch Quotation History
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  // 3. Fetch Service History (Invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, vehicles(plate_number, make, model), invoice_items(description)')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })`;

  c = c.replace(/  \/\/ 2\. Fetch Quotation History[\s\S]*?\.order\('created_at', \{ ascending: false \}\)/, queryStr);
  
  // Add Component injection
  // Wait, in vehicles/[id]/page.tsx, it currently says:
  // {/* Right Column: Quotation History */}
  // ...
  // Service History ({quotations?.length || 0})
  // Let's replace the header text from "Service History" to "Quotation History" for the old block
  // and insert CustomerServiceHistory BEFORE it.

  c = c.replace(/\{\/\* Right Column: Quotation History \*\/\}/g, "{/* Right Column: History */}");
  c = c.replace(/Service History \(\{quotations\?\.length/g, "Quotation History ({quotations?.length");
  c = c.replace(/No service history found for this vehicle\./g, "No quotations found for this vehicle.");
  
  const injection = `        {/* Right Column: History */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <CustomerServiceHistory invoices={invoices || []} vehicles={vehicle ? [vehicle] : []} />
`;

  c = c.replace(/        \{\/\* Right Column: History \*\/\}\n        <div className="col-span-1 lg:col-span-2 space-y-6">/g, injection);
  
  fs.writeFileSync('src/app/(dashboard)/vehicles/[id]/page.tsx', c);
  console.log('Vehicle Details Page Updated');
} else {
  console.log('Already updated');
}
