const { Client } = require('pg');
const connectionString = "postgresql://postgres.dnomwkheggsvcvauvwik:Layucateca2026Secret!@aws-0-us-west-2.pooler.supabase.com:5432/postgres";
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
client.connect().then(() => {
  console.log("Connected directly!");
  client.end();
}).catch(e => {
  console.log("Error:", e.message);
});
