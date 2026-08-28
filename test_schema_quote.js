import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data: q } = await supabase.from('quotations').select('*').limit(1)
  console.log('Quotation keys:', Object.keys(q?.[0] || {}));
}
run()
