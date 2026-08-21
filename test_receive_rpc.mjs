const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/rpc/receive_po_items'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function test() {
  const payload = {
    p_po_id: "00000000-0000-0000-0000-000000000000",
    p_receive_date: "2026-08-21",
    p_supplier_ref: "TEST",
    p_notes: "TEST",
    p_items: [],
    p_user_id: "00000000-0000-0000-0000-000000000000"
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify(payload)
  })
  
  const data = await res.text()
  console.log("Status:", res.status)
  console.log("Response:", data)
}
test()
