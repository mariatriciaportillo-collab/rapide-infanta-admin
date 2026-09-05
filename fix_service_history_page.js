const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/service-history/page.tsx', 'utf8');

// Replace table source and fetch logic
c = c.replace(/from\('service_history'\)/g, "from('invoices')");
c = c.replace(/select\('([^']+)'\)/g, "select('*, vehicles(plate_number, make, model), customers(name), invoice_items(description)')");
c = c.replace(/order\('service_date'/g, "order('created_at'");

// Replace filter logic
c = c.replace(/const sname = h\.service_name\?\.toLowerCase\(\) \|\| ''/g, 
  "const items = h.invoice_items || []; const sname = items.map((i: any) => i.description).join(' ').toLowerCase();");
c = c.replace(/return plate\.includes\(term\) \|\| cname\.includes\(term\) \|\| sname\.includes\(term\)/g, 
  "return plate.includes(term) || cname.includes(term) || sname.includes(term) || (h.invoice_number && h.invoice_number.toLowerCase().includes(term))");

// Replace rendering fields
c = c.replace(/h\.service_date/g, "h.created_at");
c = c.replace(/\{h\.service_name \|\| '-'\}/g, 
  "{h.invoice_items && h.invoice_items.length > 0 ? h.invoice_items.slice(0, 3).map((i: any) => i.description).filter(Boolean).join(', ') : 'General Service'}");
c = c.replace(/\{h\.oil_type\}<\/div>\}/g, "</div>}"); // remove oil type if it exists
c = c.replace(/\{h\.oil_type && <div className="text-sm text-slate-500">/g, "{/* oil_type */}");

// Reference to invoice
c = c.replace(/h\.invoice_id/g, "h.id");
c = c.replace(/h\.invoices\?\.invoice_number/g, "h.invoice_number");

fs.writeFileSync('src/app/(dashboard)/service-history/page.tsx', c);
console.log('Global Service History Page Updated');
