import { NextResponse } from "next/server";
import { Pool } from "pg";
import dns from "dns";

dns.setDefaultResultOrder("ipv6first");

export async function GET() {
  const connectionString = "postgresql://postgres:Layucateca2026Secret!@db.dnomwkheggsvcvauvwik.supabase.co:6543/postgres?pgbouncer=true";
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return NextResponse.json({ success: true, time: result.rows[0], url: connectionString, dnsOrder: 'ipv6first' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, code: err.code, stack: err.stack, url: connectionString });
  }
}
