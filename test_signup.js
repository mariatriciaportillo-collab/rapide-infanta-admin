const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'testagent123@example.com',
    password: 'Password123!',
  });
  console.log("Signup Error:", error);
  console.log("Signup Data:", data);
  
  if (data?.session) {
    // Try to insert
    const { data: d2, error: e2 } = await supabase.from('customers').insert({
      customer_type: 'WRONG_VALUE',
      name: 'TEST'
    });
    console.log("Insert Error:", e2);
  }
}
run();
