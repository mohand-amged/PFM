import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const runtime = 'nodejs';

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success to avoid user enumeration
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomUUID();
    const expires = addHours(new Date(), 1);

    await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/api/auth/password/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ok: true, resetUrl });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
