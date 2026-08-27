const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: lsData, error: lsErr } = await supabase.from('labor_services').select('id').limit(1);
  console.log("labor_services pk type:", lsData && lsData.length ? typeof lsData[0].id : lsErr, lsData);
  
  const { data: ptData, error: ptErr } = await supabase.from('parts').select('id').limit(1);
  console.log("parts pk type:", ptData && ptData.length ? typeof ptData[0].id : ptErr, ptData);
}
check();
