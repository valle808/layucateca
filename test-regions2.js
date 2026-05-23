const { Client } = require('pg');

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function checkRegion(region) {
  const connectionString = `postgresql://postgres.dnomwkheggsvcvauvwik:Layucateca2026Secret!@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log(`[SUCCESS] Region found: ${region}`);
    await client.end();
    process.exit(0);
  } catch (e) {
    if (e.message && e.message.includes('Tenant or user not found')) {
      // Wrong region
    } else {
      console.log(`[FAIL] ${region}: ${e.message}`);
    }
  }
}

async function run() {
  for (const region of regions) {
    await checkRegion(region);
  }
}

run();
