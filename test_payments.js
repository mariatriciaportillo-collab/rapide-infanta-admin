const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('payments').select('*');
  console.log("Error:", error);
  console.log("Payments count:", data?.length);
  if (data?.length > 0) {
    console.log("Sample payment:", data[0]);
  }
}
test();
