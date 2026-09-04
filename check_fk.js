const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('payments').select('*, invoices(invoice_number)').limit(1);
  console.log("Invoices relation error:", error);

  const { data: d2, error: e2 } = await supabase.from('payments').select('*, quotations(quotation_number)').limit(1);
  console.log("Quotations relation error:", e2);
  
  const { data: d3, error: e3 } = await supabase.from('payments').select('*, quick_sales(quick_sale_number)').limit(1);
  console.log("Quick sales relation error:", e3);
}
check();
