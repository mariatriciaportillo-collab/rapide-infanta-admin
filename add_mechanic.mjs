import { Client } from 'pg';
import fs from 'fs';

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL environment variable is required.");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    const sql = fs.readFileSync('fix_mechanic_schema.sql', 'utf8');
    await client.query(sql);
    console.log("Migration applied successfully!");
    await client.end();
  } catch (err) {
    console.error("Database Error:", err.message);
    process.exit(1);
  }
}
run();
