const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// For admin we might need service key but let's try anon or see if we can just query the rest API

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tables = ['quick_sales', 'quick_sale_items', 'invoices', 'invoice_items', 'payments', 'payment_allocations'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t} check error:`, error.message);
    } else {
      console.log(`Table ${t} exists.`);
    }
  }
}
check();
