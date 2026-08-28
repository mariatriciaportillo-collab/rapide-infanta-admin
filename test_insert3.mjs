import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
    console.log("Checking notes...");
    const { error: e1 } = await supabase.from('vehicles').select('notes').limit(1)
    console.log("notes error:", e1?.message || "No error (exists)");

    console.log("Checking metadata...");
    const { error: e2 } = await supabase.from('vehicles').select('metadata').limit(1)
    console.log("metadata error:", e2?.message || "No error (exists)");
    
    console.log("Checking color...");
    const { error: e3 } = await supabase.from('vehicles').select('color').limit(1)
    console.log("color error:", e3?.message || "No error (exists)");
}
test()
