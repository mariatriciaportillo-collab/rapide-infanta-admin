const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('vehicles').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("Vehicle Columns:", Object.keys(data[0]));
  } else {
    // If no data, try to insert an empty row to get a validation error that lists columns, or use a known REST trick
    const { error: insertError } = await supabase.from('vehicles').insert({});
    console.log("Insert error (might contain schema info):", insertError);
  }
}
check();
