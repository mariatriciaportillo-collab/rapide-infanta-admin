const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('payments').select('*').or("invoice_id.eq.3860bb4a-a430-4eec-8c11-9a7da88f5727,quotation_id.eq.3860bb4a-a430-4eec-8c11-9a7da88f5727");
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
