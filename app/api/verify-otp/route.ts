import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { phone, code } = await req.json();

  const otp = await prisma.otp.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  }

  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({
      data: { phone },
    });
  }

  const token = jwt.sign({ sub: user.id, phone: user.phone, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  return NextResponse.json({ token, user });
}
