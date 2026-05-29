import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/whatsapp/templates
export async function GET() {
  const templates = await prisma.waTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

// POST /api/whatsapp/templates — create a template
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    category,
    subject,
    content,
    footer,
    mediaUrl,
    mediaType,
    donationUrl,
    variables,
    buttons,
    isDefault,
  } = body;

  if (!name || !content) {
    return NextResponse.json(
      { error: "name and content are required" },
      { status: 400 }
    );
  }

  const template = await prisma.waTemplate.create({
    data: {
      name,
      category: category ?? "message",
      subject: subject ?? null,
      content,
      footer: footer ?? null,
      mediaUrl: mediaUrl ?? null,
      mediaType: mediaType ?? null,
      donationUrl: donationUrl ?? null,
      variables: JSON.stringify(variables ?? []),
      buttons: JSON.stringify(buttons ?? []),
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

// PUT /api/whatsapp/templates — update a template
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const template = await prisma.waTemplate.update({
    where: { id },
    data: {
      ...data,
      variables: data.variables ? JSON.stringify(data.variables) : undefined,
      buttons: data.buttons ? JSON.stringify(data.buttons) : undefined,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(template);
}

// DELETE /api/whatsapp/templates?id=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.waTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
