const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers:customer_id(name, first_name, last_name, customer_type),
          vehicles:vehicle_id(plate_number, make, model)
        `)
        .order('created_at', { ascending: false })
  console.log(data?.length, error);
}
check();
