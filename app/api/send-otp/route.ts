import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { phone } = await req.json();

  // dev mode
  const code = "123456";
  const expiresAt = process.env.NODE_ENV === "development" ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : new Date(Date.now() + 1000 * 60 * 5);

  await prisma.otp.create({
    data: { phone, code, expiresAt },
  });

  console.log(`[DEV] OTP sent to ${phone}: ${code}`);

  return NextResponse.json({ success: true });
}
