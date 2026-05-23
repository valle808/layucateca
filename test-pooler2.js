const { Client } = require('pg');
const regions = ['ap-east-1', 'ap-northeast-3', 'eu-north-1', 'us-east-1'];
async function checkRegion(region) {
  const connectionString = `postgresql://postgres.dnomwkheggsvcvauvwik:Layucateca2026Secret!@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log(`[SUCCESS] Auth successful on ${region}`);
    await client.end();
  } catch (err) {
    if (err.message && !err.message.includes('tenant/user') && !err.message.includes('Tenant or user not found')) {
      console.log(`[INFO] ${region} returned error: ${err.message}`);
    }
  }
}
async function run() {
  await Promise.all(regions.map(r => checkRegion(r)));
  console.log("Done.");
}
run();
