const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('quotations').select('*').limit(1);
  if (error) console.log(error);
  else console.log(data ? Object.keys(data[0] || {}) : []);
}
check();
