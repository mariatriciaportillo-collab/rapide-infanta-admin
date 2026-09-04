const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: q, error: eq } = await supabase.from('quotations').select('*').limit(1);
  console.log("Quotations cols:", q ? Object.keys(q[0] || {}) : eq);
}
check();
