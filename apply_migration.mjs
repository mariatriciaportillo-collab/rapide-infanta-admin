import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL environment variable is required.");
    console.error("Usage: DATABASE_URL=postgres://... node apply_migration.mjs");
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20240828000000_create_employees.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Applying migration...");
    await client.query(sql);
    console.log("Migration applied successfully!");

    // Verify
    const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees'");
    if (res.rows.length > 0) {
      console.log("Verification Passed: public.employees exists in the database.");
    } else {
      console.error("Verification Failed: Table was not found after creation.");
    }

    await client.end();
  } catch (err) {
    console.error("Database Error:", err.message);
    process.exit(1);
  }
}
run();
