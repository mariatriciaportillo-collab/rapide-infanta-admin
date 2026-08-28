import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
    console.log("Checking chassis_no...");
    const { error: e1 } = await supabase.from('vehicles').select('chassis_no').limit(1)
    console.log("chassis_no error:", e1?.message || "No error (exists)");

    console.log("Checking displacement...");
    const { error: e2 } = await supabase.from('vehicles').select('displacement').limit(1)
    console.log("displacement error:", e2?.message || "No error (exists)");

    console.log("Checking full schema (select *) ...");
    const { data, error: e3 } = await supabase.from('vehicles').select('*').limit(1)
    if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("No data returned or error:", e3?.message);
    }
}
test()
