const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('customers').insert({
    customer_type: 'INDIVIDUAL',
    name: 'TEST INDIVIDUAL',
    first_name: 'TEST',
    last_name: 'INDIVIDUAL'
  }).select();
  console.log("INDIVIDUAL insert result:", error);
  if (!error && data) {
    await supabase.from('customers').delete().eq('id', data[0].id);
  }
  
  const { data: d2, error: e2 } = await supabase.from('customers').insert({
    customer_type: 'COMPANY',
    name: 'TEST COMPANY'
  }).select();
  console.log("COMPANY insert result:", e2);
  if (!e2 && d2) {
    await supabase.from('customers').delete().eq('id', d2[0].id);
  }

  const { data: d3, error: e3 } = await supabase.from('customers').insert({
    customer_type: 'individual',
    name: 'TEST INDIVIDUAL 2',
    first_name: 'TEST',
    last_name: 'INDIVIDUAL'
  }).select();
  console.log("individual (lowercase) insert result:", e3);
  if (!e3 && d3) {
    await supabase.from('customers').delete().eq('id', d3[0].id);
  }
  
  const { data: d4, error: e4 } = await supabase.from('customers').insert({
    customer_type: 'company',
    name: 'TEST COMPANY 2'
  }).select();
  console.log("company (lowercase) insert result:", e4);
  if (!e4 && d4) {
    await supabase.from('customers').delete().eq('id', d4[0].id);
  }
}
run();
