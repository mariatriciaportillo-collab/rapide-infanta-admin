const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: q, error: eq } = await supabase.from('quotations').select('*').limit(1);
  console.log("Quotations cols:", q ? Object.keys(q[0] || {}) : eq);

  const { data: p, error: ep } = await supabase.from('payments').select('*').limit(1);
  console.log("Payments cols:", p ? Object.keys(p[0] || {}) : ep);

  const { data: e, error: ee } = await supabase.from('estimates').select('*').limit(1);
  console.log("Estimates cols:", e ? Object.keys(e[0] || {}) : ee);
  
  const { data: i, error: ei } = await supabase.from('invoices').select('*').limit(1);
  console.log("Invoices cols:", i ? Object.keys(i[0] || {}) : ei);
}
check();
