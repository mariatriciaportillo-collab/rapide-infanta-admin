const fs = require('fs');
let path = 'src/app/(dashboard)/payments/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldQuery = `    // 2. Fetch Payment History
    const { data: payData } = await supabase
      .from('payments')
      .select(\`
        *,
        customers:customer_id(name, first_name, last_name, customer_type),
        invoices:invoice_id(invoice_number),
        quick_sales:quick_sale_id(quick_sale_number),
        quotations:quotation_id(quote_number)
      \`)
      .order('created_at', { ascending: false })
      .limit(50)`;

const newQuery = `    // 2. Fetch Payment History
    const { data: payData } = await supabase
      .from('payments')
      .select(\`
        *,
        customers:customer_id(name, first_name, last_name, customer_type),
        invoices:invoice_id(invoice_number),
        quick_sales:quick_sale_id(quick_sale_number),
        quotations:quotation_id(quote_number)
      \`)
      .neq('payment_type', 'DOWNPAYMENT')
      .order('created_at', { ascending: false })
      .limit(50)`;

content = content.replace(oldQuery, newQuery);
fs.writeFileSync(path, content);
