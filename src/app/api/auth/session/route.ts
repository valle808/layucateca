import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ly_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Fetch fresh user data from DB (in case role/avatar changed)
    const user = await (prisma as any).user.findUnique({
      where: { id: sessionData.id },
      include: { reputation: true },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("[AUTH SESSION ERROR]", error);
    return NextResponse.json({ user: null });
  }
}
