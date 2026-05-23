import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Secure SHA-256 hash using Node's crypto
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const userId = crypto.randomUUID();
    const { data: userArray, error: insertError } = await supabase
      .from('User')
      .insert([{
        id: userId,
        email,
        name,
        password: hashedPassword,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role: "USER",
        updatedAt: new Date().toISOString(),
      }])
      .select();

    if (insertError) throw insertError;
    const user = userArray[0];

    // Create reputation record
    const { error: repError } = await supabase
      .from('Reputation')
      .insert([{
        id: crypto.randomUUID(),
        userId: user.id,
        score: 100,
        badges: JSON.stringify(["Citizen"]),
        updatedAt: new Date().toISOString(),
      }]);

    if (repError) throw repError;

    // Strip password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[AUTH REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
