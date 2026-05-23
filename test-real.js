const { Client } = require('pg');
async function test() {
  const directStr = "postgresql://postgres:Layucateca2026Secret!@db.dnomwkheggsvcvauvwik.supabase.co:5432/postgres";
  const poolerStr = "postgresql://postgres.dnomwkheggsvcvauvwik:Layucateca2026Secret!@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
  
  console.log("Testing direct...");
  const c1 = new Client({ connectionString: directStr, ssl: { rejectUnauthorized: false } });
  try {
    await c1.connect();
    console.log("Direct connected!");
    await c1.end();
  } catch(e) {
    console.log("Direct failed:", e.message);
  }

  console.log("Testing pooler...");
  const c2 = new Client({ connectionString: poolerStr, ssl: { rejectUnauthorized: false } });
  try {
    await c2.connect();
    console.log("Pooler connected!");
    await c2.end();
  } catch(e) {
    console.log("Pooler failed:", e.message);
  }
}
test();
