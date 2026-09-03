const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const searchTerm = 'TOY';
  let query = supabase.from('vehicles').select('*').limit(20);
  query = query.or(`plate_number.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
  const { data, error } = await query;
  console.log("Error:", error);
}
test();
