import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function checkTable(name) {
  const { error } = await supabase.from(name).select('id').limit(1)
  console.log(name, error ? error.message : "Exists!")
}

async function run() {
  await checkTable('Employee')
  await checkTable('employees')
  await checkTable('staff')
  await checkTable('users')
  await checkTable('personnel')
  await checkTable('service_advisors')
  await checkTable('mechanics')
  await checkTable('user_profiles')
  await checkTable('profiles')
}
run()
