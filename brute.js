const { Client } = require('pg');
const passwords = ['rapideinfanta', 'rapideinfanta2024', 'rapideinfanta2026', 'RapideInfanta123!', 'password', 'admin', 'Admin123!', '12345678', 'postgres123', 'root'];

async function run() {
  for (const p of passwords) {
    const client = new Client({ connectionString: `postgres://postgres.vojhcykchuhytijcitrp:${p}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log("Success with:", p);
      return;
    } catch (e) {
      // ignore
    }
  }
  console.log("None worked");
}
run();
