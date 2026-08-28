import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data: q } = await supabase.from('quotations').select('*').limit(1)
  console.log('Quotation keys:', Object.keys(q?.[0] || {}));
  const { data: p } = await supabase.from('payments').select('*').limit(1)
  console.log('Payments keys:', Object.keys(p?.[0] || {}));
  const { data: i } = await supabase.from('invoices').select('*').limit(1)
  console.log('Invoices keys:', Object.keys(i?.[0] || {}));
}
run()
