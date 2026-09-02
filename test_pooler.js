const { Client } = require('pg');
async function run() {
  const client = new Client({
    connectionString: "postgres://postgres.vojhcykchuhytijcitrp:postgres@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
  });
  try {
    await client.connect();
    console.log("Connected to pooler!");
    await client.end();
  } catch (e) {
    console.log("Pooler err:", e.message);
  }
}
run();
