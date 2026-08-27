const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('packages').select('id').limit(1);
  console.log("Packages:", error ? error.message : "Exists");
  const { data: data2, error: error2 } = await supabase.from('package_items').select('id').limit(1);
  console.log("Package Items:", error2 ? error2.message : "Exists");
}
check();
