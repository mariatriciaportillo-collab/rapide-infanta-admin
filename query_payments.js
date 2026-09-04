const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Payments Error:", error);
  console.log("Payments Data:", data);
}
test();
