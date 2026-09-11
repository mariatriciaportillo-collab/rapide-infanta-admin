const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const payload = {
    customer_type: 'INVALID_TYPE',
    name: null, // this might trigger a NOT NULL constraint
  };
  
  const { data, error } = await supabase.from('customers').insert([payload]).select();
  console.log(`Failed with:`, error.message);
}

run();
