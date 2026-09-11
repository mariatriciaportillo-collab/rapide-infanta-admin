const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('parts').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("Keys:", Object.keys(data[0]));
  } else if (error) {
    console.log("Error:", error);
  } else {
    console.log("No data found.");
  }
}
check();
