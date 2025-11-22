import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromHeader } from "@/lib/auth";

// GET: 프로필 조회
export async function GET(req: Request) {
  const user = getUserFromHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "EMPLOYER") {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: user.sub },
    });
    return NextResponse.json({ role: "EMPLOYER", profile });
  }

  if (user.role === "SITTER") {
    const profile = await prisma.sitterProfile.findUnique({
      where: { userId: user.sub },
    });
    return NextResponse.json({ role: "SITTER", profile });
  }

  return NextResponse.json({ error: "Role not set" }, { status: 400 });
}

// POST: 프로필 생성
export async function POST(req: Request) {
  const user = getUserFromHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (user.role === "EMPLOYER") {
    const created = await prisma.employerProfile.create({
      data: {
        userId: user.sub,
        address: body.address,
        children: body.children,
        needs: body.needs,
      },
    });
    return NextResponse.json({ profile: created });
  }

  if (user.role === "SITTER") {
    const created = await prisma.sitterProfile.create({
      data: {
        userId: user.sub,
        bio: body.bio,
        experience: body.experience,
        skills: body.skills,
        availableTime: body.availableTime,
      },
    });
    return NextResponse.json({ profile: created });
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}

// PATCH: 프로필 수정
export async function PATCH(req: Request) {
  const user = getUserFromHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (user.role === "EMPLOYER") {
    const updated = await prisma.employerProfile.update({
      where: { userId: user.sub },
      data: body,
    });
    return NextResponse.json({ profile: updated });
  }

  if (user.role === "SITTER") {
    const updated = await prisma.sitterProfile.update({
      where: { userId: user.sub },
      data: body,
    });
    return NextResponse.json({ profile: updated });
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}
