const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('labor_services').select().limit(1);
  console.log("Error:", error);
  console.log("Labor Services cols:", data && data.length > 0 ? Object.keys(data[0]) : "Empty table, checking view or inserting dummy");
  
  // If empty, let's insert a dummy and rollback? Or just query information_schema if possible via postgrest? 
  // No, can't query information_schema easily via postgrest.
}
test();
