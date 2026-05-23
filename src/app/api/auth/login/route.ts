import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña requeridos" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('User')
      .select('*, reputation:Reputation(*)')
      .eq('email', email)
      .single();

    if (error || !user || !user.password) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 400 }
      );
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    if (hashedPassword !== user.password) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 400 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });

    // Set simple cookie session (valid for 7 days)
    response.cookies.set("ly_session", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[AUTH LOGIN ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
