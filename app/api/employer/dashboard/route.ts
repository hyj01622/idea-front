import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const token = auth.replace('Bearer ', '');

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const employerId = decoded.sub;

    // 1) 고용 중(active)인 시터 목록
    const sitters = await prisma.match.findMany({
      where: {
        employerId,
        active: true,
      },
      include: {
        sitter: true,
      },
    });

    // 2) 진행 중인 매칭 요청들
    const matchingRequests = await prisma.matchRequest.findMany({
      where: {
        employerId,
        status: 'PENDING',
      },
      include: {
        sitter: true,
      },
    });

    return NextResponse.json({
      sitters: sitters.map((m) => ({
        id: m.sitter.id,
        name: m.sitter.name ?? 'Unnamed',
        contractEnd: m.contractEnd,
        visaExpire: m.visaExpire,
      })),
      matchingRequests: matchingRequests.map((r) => ({
        id: r.id,
        sitterName: r.sitter.name ?? 'Unknown',
        status: r.status,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
