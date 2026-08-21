import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  console.log("Testing create_purchase_order RPC directly via Supabase client...")
  const payload = {
    p_supplier_id: "00000000-0000-0000-0000-000000000000",
    p_order_date: "2026-08-20",
    p_expected_date: "2026-08-20",
    p_reference: "TEST-REF",
    p_terms: "TEST-TERMS",
    p_notes: "TEST-NOTES",
    p_items: [
      {
        part_id: "00000000-0000-0000-0000-000000000000",
        qty: 5,
        unit_cost: 450,
        total_amount: 2250
      }
    ],
    p_user_id: "00000000-0000-0000-0000-000000000000"
  }
  
  const { data, error } = await supabase.rpc('create_purchase_order', payload)
  if (error) {
    console.error("Direct RPC Error:", error)
  } else {
    console.log("Direct RPC Success:", data)
  }
}

test()
