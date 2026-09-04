const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('payments').select('id, receipt_number, customer_receipt, payment_type').limit(10);
  console.log("Error:", error);
  console.log("Payments:", data);
}
test();
