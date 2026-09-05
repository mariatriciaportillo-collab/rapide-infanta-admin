const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('invoice_items').select('description').limit(1);
  console.log("description:", error);
  const { data: d2, error: e2 } = await supabase.from('invoice_items').select('item_name').limit(1);
  console.log("item_name:", e2);
  const { data: d3, error: e3 } = await supabase.from('invoice_items').select('name').limit(1);
  console.log("name:", e3);
}
run();
