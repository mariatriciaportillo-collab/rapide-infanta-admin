const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: p } = await supabase.from('packages').select('*').limit(1);
  console.log("Packages:", Object.keys(p[0] || {}));
  const { data: l } = await supabase.from('labor_services').select('*').limit(1);
  console.log("Labor:", Object.keys(l[0] || {}));
}
check();
