export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('Post')
      .select('*')
      .eq('published', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
