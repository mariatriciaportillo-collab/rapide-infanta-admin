const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: ei, error } = await supabase.from('estimate_items').select('*').limit(1);
  if (error) console.log(error);
  console.log("Estimate Items:", Object.keys(ei[0] || {}));
}
check();
