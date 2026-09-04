const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('labor_services').select('*').limit(1);
  console.log("Error:", error);
  console.log("Labor Services:", data);

  const { data: charges, error: cError } = await supabase.from('labor_charges').select('*').limit(1);
  console.log("Charges Error:", cError);
  console.log("Labor Charges:", charges);
}
test();
