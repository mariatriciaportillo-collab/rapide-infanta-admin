const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('quotations').select('id, quote_number, status, downpayment_required, downpayment_status, downpayment_paid_amount, required_downpayment_amount');
  console.log("Quotations:", data);
}
test();
