const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const tables = ['customers', 'vehicles', 'estimates', 'service_packages', 'labor_services', 'packages', 'labor', 'labor_charges'];
  for (let t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    if (error) console.log(t, "ERROR:", error.message);
    else console.log(t, "EXISTS");
  }
}
check();
