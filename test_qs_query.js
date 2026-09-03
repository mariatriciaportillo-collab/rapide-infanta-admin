const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const searchTerm = 'ANNA';
  let query = supabase.from('customers').select('*').limit(20);
  query = query.or(`name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,contact_first_name.ilike.%${searchTerm}%,contact_last_name.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%`);
  const { data, error } = await query;
  console.log("Error:", error);
}
test();
