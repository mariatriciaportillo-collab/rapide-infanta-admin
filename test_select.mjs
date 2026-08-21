const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/inventory_transactions?select=*,inventory_movements(quantity,unit_cost,parts(name))&limit=1'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function test() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key
    }
  })
  
  const data = await res.text()
  console.log("Status:", res.status)
  console.log("Response:", data)
}
test()
