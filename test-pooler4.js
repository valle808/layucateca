const { Client } = require('pg');
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1', 'ap-east-1'
];
async function checkRegion(region) {
  const connectionString = `postgresql://postgres.dnomwkheggsvcvauvwik:Layucateca2026Secret%21@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log(`[SUCCESS] Auth successful on ${region}`);
    await client.end();
  } catch (err) {
    if (err.message && !err.message.includes('tenant') && !err.message.includes('password')) {
      console.log(`[INFO] ${region} returned error: ${err.message}`);
    }
  }
}
async function run() {
  await Promise.all(regions.map(r => checkRegion(r)));
  console.log("Done.");
}
run();
