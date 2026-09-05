const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('customers').insert({
    customer_type: 'INDIVIDUAL',
    name: 'TEST INDIVIDUAL',
    first_name: 'TEST',
    last_name: 'INDIVIDUAL'
  }).select();
  console.log("INDIVIDUAL insert result:", error);
  
  const { data: d2, error: e2 } = await supabase.from('customers').insert({
    customer_type: 'COMPANY',
    name: 'TEST COMPANY'
  }).select();
  console.log("COMPANY insert result:", e2);

  const { data: d3, error: e3 } = await supabase.from('customers').insert({
    customer_type: 'Individual',
    name: 'TEST INDIVIDUAL 2',
    first_name: 'TEST',
    last_name: 'INDIVIDUAL'
  }).select();
  console.log("Individual (mixed case) insert result:", e3);
}
run();
