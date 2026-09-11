const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  // Query a system table if possible or just rely on REST API failure messages
  const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
    headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  });
  const data = await res.json();
  console.log(data);
}
check();
