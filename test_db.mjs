import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, column_default, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'quotation_items';
  `);
  console.log(res.rows);
  await client.end();
}
run();
