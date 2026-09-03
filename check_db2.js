const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const tables = ['quotations', 'payments', 'estimates', 'invoices'];
  for (const t of tables) {
    const { data, error } = await supabase.rpc('get_table_columns_v2', { table_name: t }).catch(() => ({data: null}));
    if (data) {
      console.log(t, data);
    } else {
       // fallback if rpc doesn't exist
       const { data: d2 } = await supabase.from(t).select().limit(1);
       // we can't easily get column names if empty via JS API without rpc or trying to insert.
       // Let's just grep the sql files
    }
  }
}
check();
