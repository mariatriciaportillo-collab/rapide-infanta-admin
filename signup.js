const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_probe@example.com',
    password: 'Password123!',
  });
  console.log('Signup result:', error ? error.message : 'SUCCESS');
  if (data?.session) {
    console.log('Token:', data.session.access_token);
  }
}
run();
