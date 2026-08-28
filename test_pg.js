const { Client } = require('pg');
async function run() {
  const client = new Client({
    connectionString: "postgres://postgres:postgres@db.vojhcykchuhytijcitrp.supabase.co:5432/postgres"
  });
  try {
    await client.connect();
    console.log("Connected!");
    await client.end();
  } catch (e) {
    console.log(e.message);
  }
}
run();
