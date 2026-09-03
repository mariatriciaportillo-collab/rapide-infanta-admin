const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('parts').select('*').limit(1);
  if (error) console.error(error.message);
  else console.log("Parts Columns:", Object.keys(data[0] || {}).join(', '));
}
check();
