import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWaManager } from "@/lib/whatsapp-manager";

export const dynamic = "force-dynamic";

// GET /api/whatsapp/contacts — return saved contacts from DB
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const isGroup = searchParams.get("group");

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { notify: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { jid: { contains: q } },
    ];
  }
  if (isGroup === "true") where.isGroup = true;
  if (isGroup === "false") where.isGroup = false;

  const contacts = await prisma.waContact.findMany({
    where,
    orderBy: [{ isGroup: "asc" }, { name: "asc" }],
    take: 500,
  });

  return NextResponse.json(contacts);
}

// POST /api/whatsapp/contacts/sync — pull from in-memory manager and upsert to DB
export async function POST() {
  const manager = getWaManager();
  const state = manager.getState();

  if (state.status !== "connected") {
    return NextResponse.json(
      { error: "WhatsApp not connected" },
      { status: 400 }
    );
  }

  const all = [...state.contacts, ...state.groups.map((g) => ({
    jid: g.id,
    name: g.subject,
    notify: g.subject,
    phone: undefined,
    isGroup: true,
  }))];

  let saved = 0;
  for (const c of all) {
    if (!c.jid) continue;
    await prisma.waContact.upsert({
      where: { jid: c.jid },
      create: {
        jid: c.jid,
        name: c.name ?? c.notify ?? null,
        notify: c.notify ?? null,
        phone: c.phone ?? c.jid.split("@")[0],
        isGroup: c.isGroup ?? c.jid.endsWith("@g.us"),
      },
      update: {
        name: c.name ?? c.notify ?? undefined,
        notify: c.notify ?? undefined,
      },
    });
    saved++;
  }

  return NextResponse.json({ ok: true, saved });
}
