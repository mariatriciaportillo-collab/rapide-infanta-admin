const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const types = ['individual', 'company', 'Individual', 'Company', 'INDIVIDUAL', 'COMPANY', 'Idividual'];
  
  for (const t of types) {
    const payload = {
      customer_type: t,
      name: 'TEST PROBE',
    };
    
    const { data, error } = await supabase.from('customers').insert([payload]).select();
    if (error) {
      console.log(`Type ${t} failed with:`, error.message);
    } else {
      console.log(`Type ${t} SUCCEEDED!`, data);
    }
  }
}

run();
