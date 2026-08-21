const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/suppliers?limit=1'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function test() {
  const res = await fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
  const data = await res.text()
  console.log(data)
}
test()
