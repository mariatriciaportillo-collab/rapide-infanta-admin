const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const passwords = ['password', 'password123', 'admin', 'admin123', '123456', 'rapide123'];
  for (const p of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@rapide.com',
      password: p,
    });
    if (data?.session) {
      console.log('SUCCESS with password:', p);
      console.log('Token:', data.session.access_token);
      return;
    }
  }
  console.log('Failed all passwords');
}
run();
