import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL is undefined" }, { status: 500 });
  }

  try {
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const result = await pool.query("SELECT 1 AS ok");
    await pool.end();

    return NextResponse.json({
      success: true,
      dbUrlExists: !!dbUrl,
      dbUrlPrefix: dbUrl.substring(0, 15) + "...",
      result: result.rows
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
