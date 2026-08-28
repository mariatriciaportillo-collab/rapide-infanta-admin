import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  // Try to query quotation_items to see if at least one table works
  const { error } = await supabase.from('quotations').select('id').limit(1)
  console.log("quotations:", error ? error.message : "Exists!")
}
run()
