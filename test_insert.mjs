import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
    console.log("Checking engine_capacity...");
    const { error: e1 } = await supabase.from('vehicles').select('engine_capacity').limit(1)
    console.log("engine_capacity error:", e1?.message || "No error (exists)");

    console.log("Checking vin...");
    const { error: e2 } = await supabase.from('vehicles').select('vin').limit(1)
    console.log("vin error:", e2?.message || "No error (exists)");

    console.log("Checking chassis_number...");
    const { error: e3 } = await supabase.from('vehicles').select('chassis_number').limit(1)
    console.log("chassis_number error:", e3?.message || "No error (exists)");
    
    console.log("Checking engine...");
    const { error: e4 } = await supabase.from('vehicles').select('engine').limit(1)
    console.log("engine error:", e4?.message || "No error (exists)");
}
test()
